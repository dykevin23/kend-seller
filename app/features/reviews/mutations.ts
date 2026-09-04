import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

// 답변은 UPDATE 방식(seller_reply, seller_replied_at 두 컬럼만 채움) — 별도 이력 테이블 없음.
// 같은 함수로 등록/수정 둘 다 처리(존재하면 덮어씀)
export const replyToReview = async (
  client: SupabaseClient<Database>,
  { reviewId, sellerId, reply }: { reviewId: string; sellerId: string; reply: string }
) => {
  if (!reply.trim()) {
    return { success: false, error: "답변 내용을 입력해주세요." };
  }

  // 이 리뷰가 실제로 이 판매자 상품에 달린 것인지 확인(소유권 가드)
  const { data: review, error: fetchError } = await client
    .from("reviews")
    .select("id, products!inner ( seller_id )")
    .eq("id", reviewId)
    .eq("products.seller_id", sellerId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!review) {
    return { success: false, error: "리뷰를 찾을 수 없습니다." };
  }

  const { error } = await client
    .from("reviews")
    .update({
      seller_reply: reply.trim(),
      seller_replied_at: new Date().toISOString(),
    })
    .eq("id", reviewId);

  if (error) return { success: false, error: error.message };
  return { success: true };
};

export const deleteReviewReply = async (
  client: SupabaseClient<Database>,
  { reviewId, sellerId }: { reviewId: string; sellerId: string }
) => {
  const { data: review, error: fetchError } = await client
    .from("reviews")
    .select("id, products!inner ( seller_id )")
    .eq("id", reviewId)
    .eq("products.seller_id", sellerId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!review) {
    return { success: false, error: "리뷰를 찾을 수 없습니다." };
  }

  const { error } = await client
    .from("reviews")
    .update({ seller_reply: null, seller_replied_at: null })
    .eq("id", reviewId);

  if (error) return { success: false, error: error.message };
  return { success: true };
};
