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
}

export const getSellerReviews = async (
  client: SupabaseClient<Database>,
  sellerId: string,
  { rating }: { rating?: string } = {}
): Promise<ReviewListItem[]> => {
  let query = client
    .from("reviews")
    .select(
      `
      id, rating, content, created_at,
      products!inner ( product_code, name, seller_id ),
      profiles ( nickname )
    `
    )
    .eq("products.seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (rating && rating !== "ALL") {
    query = query.eq("rating", Number(rating));
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
  }));
};
