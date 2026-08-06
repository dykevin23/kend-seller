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

  // confirmed_at은 최초 접수확인 시점(발송 SLA 기산점)이라 그 이후 상태전이에선 건드리지 않는다
  const updatePayload: Record<string, unknown> = { status };
  if (status === "confirmed") {
    updatePayload.confirmed_at = new Date().toISOString();
  }

  const { error: updateError } = await client
    .from("orders")
    .update(updatePayload)
    .in("id", validIds)
    .eq("seller_id", sellerId);

  if (updateError) throw updateError;

  return {
    updatedCount: validIds.length,
    skippedCount: orderIds.length - validIds.length,
  };
};

export interface MarkOrderShippedResult {
  success: boolean;
  error?: string;
}

// 배송 처리: 배송준비중 주문에 배송사+송장번호를 입력해 배송중 상태로 전환.
// 이후 배송완료 전환은 스마트택배 폴링(스케줄러)이 수행하므로 여기서 다루지 않는다.
export const markOrderShipped = async (
  client: SupabaseClient,
  {
    orderId,
    sellerId,
    courier,
    trackingNumber,
  }: {
    orderId: string;
    sellerId: string;
    courier: string;
    trackingNumber: string;
  }
): Promise<MarkOrderShippedResult> => {
  const { data: order, error: fetchError } = await client
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .eq("seller_id", sellerId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!order || order.status !== "preparing") {
    return {
      success: false,
      error: "배송준비중 상태의 주문만 배송 처리할 수 있습니다.",
    };
  }

  const { error: deliveryError } = await client
    .from("deliveries")
    .update({
      courier,
      tracking_number: trackingNumber,
      status: "shipped",
      shipped_at: new Date().toISOString(),
    })
    .eq("order_id", orderId);

  if (deliveryError) throw deliveryError;

  const { error: orderError } = await client
    .from("orders")
    .update({ status: "shipped" })
    .eq("id", orderId)
    .eq("seller_id", sellerId);

  if (orderError) throw orderError;

  return { success: true };
};
