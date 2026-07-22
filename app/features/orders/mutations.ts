import type { SupabaseClient } from "@supabase/supabase-js";

// 판매자가 이 화면에서 바꿀 수 있는 상태 전이 화이트리스트
// shipped/delivered 전환은 송장입력과 함께 배송 처리(P2-3)에서 다룸
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["cancelled"],
};

export interface UpdateOrderStatusResult {
  updatedCount: number;
  skippedCount: number;
}

// 주문 상태 일괄 변경. seller 소유가 아니거나 현재 상태에서 목표 상태로
// 전이가 불가능한 건은 조용히 건너뛰고 결과에 skippedCount로 반영한다.
export const updateOrderStatus = async (
  client: SupabaseClient,
  {
    orderIds,
    sellerId,
    status,
  }: { orderIds: string[]; sellerId: string; status: string }
): Promise<UpdateOrderStatusResult> => {
  if (orderIds.length === 0) {
    return { updatedCount: 0, skippedCount: 0 };
  }

  const { data: owned, error: fetchError } = await client
    .from("orders")
    .select("id, status")
    .eq("seller_id", sellerId)
    .in("id", orderIds);

  if (fetchError) throw fetchError;

  const validIds = (owned || [])
    .filter((order) => ALLOWED_TRANSITIONS[order.status]?.includes(status))
    .map((order) => order.id);

  if (validIds.length === 0) {
    return { updatedCount: 0, skippedCount: orderIds.length };
  }

  const { error: updateError } = await client
    .from("orders")
    .update({ status })
    .in("id", validIds)
    .eq("seller_id", sellerId);

  if (updateError) throw updateError;

  return {
    updatedCount: validIds.length,
    skippedCount: orderIds.length - validIds.length,
  };
};
