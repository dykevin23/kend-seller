import type { SupabaseClient } from "@supabase/supabase-js";

export const answerInquiry = async (
  client: SupabaseClient,
  {
    inquiryId,
    sellerId,
    answer,
  }: { inquiryId: string; sellerId: string; answer: string }
) => {
  if (!answer.trim()) {
    return { success: false, error: "답변 내용을 입력해주세요." };
  }

  // 이 문의가 실제로 이 판매자 상품에 달린 것인지 확인(소유권 가드)
  const { data: inquiry, error: fetchError } = await client
    .from("inquiries")
    .select("id, order_items!inner ( orders!inner ( seller_id ) )")
    .eq("id", inquiryId)
    .eq("order_items.orders.seller_id", sellerId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!inquiry) {
    return { success: false, error: "문의를 찾을 수 없습니다." };
  }

  const { error } = await client
    .from("inquiries")
    .update({
      status: "answered",
      answer: answer.trim(),
      answered_at: new Date().toISOString(),
    })
    .eq("id", inquiryId);

  if (error) return { success: false, error: error.message };
  return { success: true };
};

export const answerAdminInquiry = async (
  client: SupabaseClient,
  { inquiryId, answer }: { inquiryId: string; answer: string }
) => {
  if (!answer.trim()) {
    return { success: false, error: "답변 내용을 입력해주세요." };
  }

  // 일반 문의(order_item_id null)만 admin이 처리 — 판매자 문의는 이 경로로 못 건드리게 가드
  const { data: inquiry, error: fetchError } = await client
    .from("inquiries")
    .select("id")
    .eq("id", inquiryId)
    .is("order_item_id", null)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!inquiry) {
    return { success: false, error: "문의를 찾을 수 없습니다." };
  }

  const { error } = await client
    .from("inquiries")
    .update({
      status: "answered",
      answer: answer.trim(),
      answered_at: new Date().toISOString(),
    })
    .eq("id", inquiryId);

  if (error) return { success: false, error: error.message };
  return { success: true };
};
