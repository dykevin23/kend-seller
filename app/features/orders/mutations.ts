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

export interface ReturnActionResult {
  success: boolean;
  error?: string;
}

// 판매자 소유 + status='return_requested' 확인 (반품 4단계 액션 공통 가드).
// return_received_at도 함께 가져와 최종승인의 선행조건 체크에 재사용한다.
const verifyOwnedReturnRequest = async (
  client: SupabaseClient,
  { deliveryItemId, sellerId }: { deliveryItemId: string; sellerId: string }
): Promise<{ id: string; return_received_at: string | null } | null> => {
  const { data, error } = await client
    .from("delivery_items")
    .select(
      `
      id, status, return_received_at,
      order_items!inner ( orders!inner ( seller_id ) )
    `
    )
    .eq("id", deliveryItemId)
    .eq("order_items.orders.seller_id", sellerId)
    .eq("status", "return_requested")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return { id: data.id, return_received_at: data.return_received_at };
};

// 액션1: 1차 승인 (거절 후 재승인도 겸함 — reject_reason 초기화)
export const approveReturnStage1 = async (
  client: SupabaseClient,
  { deliveryItemId, sellerId }: { deliveryItemId: string; sellerId: string }
): Promise<ReturnActionResult> => {
  const owned = await verifyOwnedReturnRequest(client, { deliveryItemId, sellerId });
  if (!owned) {
    return { success: false, error: "처리할 수 없는 요청입니다." };
  }

  const { error } = await client
    .from("delivery_items")
    .update({ return_approved_at: new Date().toISOString(), reject_reason: null })
    .eq("id", deliveryItemId);

  if (error) throw error;
  return { success: true };
};

// 액션2: 거절 (1차 거절/검수 후 거절 동일 연산, status는 건드리지 않음)
export const rejectReturn = async (
  client: SupabaseClient,
  {
    deliveryItemId,
    sellerId,
    reason,
  }: { deliveryItemId: string; sellerId: string; reason: string }
): Promise<ReturnActionResult> => {
  const owned = await verifyOwnedReturnRequest(client, { deliveryItemId, sellerId });
  if (!owned) {
    return { success: false, error: "처리할 수 없는 요청입니다." };
  }

  const { error } = await client
    .from("delivery_items")
    .update({ reject_reason: reason })
    .eq("id", deliveryItemId);

  if (error) throw error;
  return { success: true };
};

// 액션3: 회수 확인
export const confirmReturnReceived = async (
  client: SupabaseClient,
  { deliveryItemId, sellerId }: { deliveryItemId: string; sellerId: string }
): Promise<ReturnActionResult> => {
  const owned = await verifyOwnedReturnRequest(client, { deliveryItemId, sellerId });
  if (!owned) {
    return { success: false, error: "처리할 수 없는 요청입니다." };
  }

  const { error } = await client
    .from("delivery_items")
    .update({ return_received_at: new Date().toISOString() })
    .eq("id", deliveryItemId);

  if (error) throw error;
  return { success: true };
};

// 액션4: 최종 승인 — status를 'returned'로 바꾸는 유일한 지점 (kend 환불 크론 트리거).
// DB가 순서를 강제하지 않으므로 회수확인(return_received_at) 여부를 여기서 직접 가드한다.
export const finalizeReturnApproval = async (
  client: SupabaseClient,
  { deliveryItemId, sellerId }: { deliveryItemId: string; sellerId: string }
): Promise<ReturnActionResult> => {
  const owned = await verifyOwnedReturnRequest(client, { deliveryItemId, sellerId });
  if (!owned) {
    return { success: false, error: "처리할 수 없는 요청입니다." };
  }
  if (!owned.return_received_at) {
    return { success: false, error: "회수 확인 후 최종 승인이 가능합니다." };
  }

  const { error } = await client
    .from("delivery_items")
    .update({ status: "returned", reject_reason: null })
    .eq("id", deliveryItemId);

  if (error) throw error;
  return { success: true };
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
