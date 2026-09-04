import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

// reviews.product_id -> products.seller_id 체인으로 본인 상품 리뷰만 필터링.
// 한 상품에 같은 사용자의 리뷰가 여러 개 있을 수 있음 — 리뷰 단위가
// "상품당 1개"가 아니라 "구매확정 건(delivery_item)당 1개"이기 때문(재구매 시 재작성 가능)

export interface ReviewListItem {
  id: string;
  rating: number;
  content: string;
  created_at: string;
  product_code: string;
  product_name: string;
  reviewer_nickname: string;
  seller_reply: string | null;
  seller_replied_at: string | null;
  images: string[];
}

export const getSellerReviews = async (
  client: SupabaseClient<Database>,
  sellerId: string,
  {
    rating,
    answered,
    periodStart,
    periodEnd,
  }: {
    rating?: string;
    answered?: string;
    periodStart?: string;
    periodEnd?: string;
  } = {}
): Promise<ReviewListItem[]> => {
  let query = client
    .from("reviews")
    .select(
      `
      id, rating, content, created_at, seller_reply, seller_replied_at,
      products!inner ( product_code, name, seller_id ),
      profiles ( nickname ),
      review_images ( url )
    `
    )
    .eq("products.seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (rating && rating !== "ALL") {
    query = query.eq("rating", Number(rating));
  }
  if (answered === "answered") {
    query = query.not("seller_replied_at", "is", null);
  } else if (answered === "unanswered") {
    query = query.is("seller_replied_at", null);
  }
  if (periodStart) {
    query = query.gte("created_at", periodStart);
  }
  if (periodEnd) {
    const exclusiveEnd = new Date(periodEnd);
    exclusiveEnd.setDate(exclusiveEnd.getDate() + 1);
    query = query.lt("created_at", exclusiveEnd.toISOString());
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((item: any) => ({
    id: item.id,
    rating: item.rating,
    content: item.content,
    created_at: item.created_at,
    product_code: item.products?.product_code ?? "-",
    product_name: item.products?.name ?? "-",
    reviewer_nickname: item.profiles?.nickname ?? "-",
    seller_reply: item.seller_reply,
    seller_replied_at: item.seller_replied_at,
    images: (item.review_images ?? []).map((image: any) => image.url),
  }));
};

export interface ReviewStats {
  totalCount: number;
  averageRating: number;
  unansweredCount: number;
  ratingCounts: Record<1 | 2 | 3 | 4 | 5, number>;
}

// 상단 요약 카드용 — 현재 필터와 무관하게 항상 전체 기준으로 집계한다
export const getSellerReviewStats = async (
  client: SupabaseClient<Database>,
  sellerId: string
): Promise<ReviewStats> => {
  const { data, error } = await client
    .from("reviews")
    .select("rating, seller_replied_at, products!inner ( seller_id )")
    .eq("products.seller_id", sellerId);

  if (error) throw error;

  const rows = data || [];
  const totalCount = rows.length;
  const ratingCounts: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  let ratingSum = 0;
  let unansweredCount = 0;

  for (const row of rows) {
    const rating = row.rating as 1 | 2 | 3 | 4 | 5;
    ratingCounts[rating] = (ratingCounts[rating] ?? 0) + 1;
    ratingSum += row.rating;
    if (!row.seller_replied_at) unansweredCount += 1;
  }

  return {
    totalCount,
    averageRating: totalCount > 0 ? ratingSum / totalCount : 0,
    unansweredCount,
    ratingCounts,
  };
};
