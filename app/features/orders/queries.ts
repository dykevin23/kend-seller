import type { SupabaseClient } from "@supabase/supabase-js";
import { isStalledInTransit } from "./constrants";

// 판매자에게 숨겨야 하는 order_group 상태 — 결제 자체가 안 된 "유령 주문"만 제외.
// paid 이후 상태(취소/환불 포함)는 판매자가 계속 볼 수 있어야 하므로 화이트리스트가 아닌
// 블랙리스트로 필터링한다 (order_groups.status가 cancelled/refunded로 바뀌어도 계속 노출됨).
const UNPAID_ORDER_GROUP_STATUSES = ["payment_in_progress", "payment_pending", "failed"];

export interface OrderListItem {
  id: string;
  order_number: string;
  status: string;
  product_amount: number;
  shipping_fee: number;
  total_amount: number;
  created_at: string;
  recipient_name: string;
  item_summary: string;
  stalled_delivery: boolean;
}

interface GetSellerOrdersParams {
  sellerId: string;
  status?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}

// 주문 목록 조회 (판매자별, 결제완료 건만)
export const getSellerOrders = async (
  client: SupabaseClient,
  { sellerId, status, keyword, page = 1, limit = 10 }: GetSellerOrdersParams
): Promise<{ data: OrderListItem[]; total: number }> => {
  let query = client
    .from("orders")
    .select(
      `
      id,
      order_number,
      status,
      product_amount,
      shipping_fee,
      total_amount,
      created_at,
      order_groups!inner ( status, recipient_name ),
      order_items ( product_name, quantity ),
      deliveries ( status, shipped_at )
    `,
      { count: "exact" }
    )
    .eq("seller_id", sellerId)
    .not(
      "order_groups.status",
      "in",
      `(${UNPAID_ORDER_GROUP_STATUSES.join(",")})`
    )
    .order("created_at", { ascending: false });

  if (status && status !== "ALL") {
    query = query.eq("status", status);
  }

  if (keyword) {
    // PostgREST는 부모 테이블(orders)과 조인 테이블(order_groups) 컬럼을
    // 하나의 or() 안에서 섞어 쓸 수 없다 — 수령인명은 먼저 order_group_id로
    // 조회한 뒤, orders 테이블 컬럼끼리만 or()로 묶는다.
    const { data: matchedGroups, error: groupsError } = await client
      .from("order_groups")
      .select("id")
      .ilike("recipient_name", `%${keyword}%`);

    if (groupsError) throw groupsError;

    const groupIds = (matchedGroups || []).map((g) => g.id);
    const orFilter =
      groupIds.length > 0
        ? `order_number.ilike.%${keyword}%,order_group_id.in.(${groupIds.join(",")})`
        : `order_number.ilike.%${keyword}%`;

    query = query.or(orFilter);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  const orders: OrderListItem[] = (data || []).map((order: any) => {
    const items = order.order_items || [];
    const itemSummary =
      items.length === 0
        ? "-"
        : items.length === 1
          ? items[0].product_name
          : `${items[0].product_name} 외 ${items.length - 1}건`;

    const deliveryRaw = order.deliveries;
    const delivery = Array.isArray(deliveryRaw)
      ? (deliveryRaw[0] ?? null)
      : (deliveryRaw ?? null);

    return {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      product_amount: order.product_amount,
      shipping_fee: order.shipping_fee,
      total_amount: order.total_amount,
      created_at: order.created_at,
      recipient_name: order.order_groups?.recipient_name ?? "-",
      item_summary: itemSummary,
      stalled_delivery: isStalledInTransit(delivery?.status, delivery?.shipped_at),
    };
  });

  return { data: orders, total: count || 0 };
};

export interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  product_amount: number;
  shipping_fee: number;
  total_amount: number;
  created_at: string;
  items: Array<{
    id: string;
    product_name: string;
    sku_code: string;
    options: unknown;
    main_image: string | null;
    quantity: number;
    subtotal: number;
  }>;
  order_group: {
    recipient_name: string;
    recipient_phone: string;
    zone_code: string;
    address: string;
    address_detail: string | null;
    delivery_message: string | null;
    payment_method: string | null;
    status: string;
    paid_at: string | null;
    payment: {
      method: string | null;
      status: string;
      receipt_url: string | null;
    } | null;
  };
  delivery: {
    courier: string | null;
    tracking_number: string | null;
    status: string;
    shipped_at: string | null;
    tracking_synced_at: string | null;
  } | null;
}

// 주문 상세 조회 (판매자 소유 검증 포함)
export const getSellerOrderDetail = async (
  client: SupabaseClient,
  { sellerId, orderNumber }: { sellerId: string; orderNumber: string }
): Promise<OrderDetail | null> => {
  const { data, error } = await client
    .from("orders")
    .select(
      `
      id,
      order_number,
      status,
      product_amount,
      shipping_fee,
      total_amount,
      created_at,
      order_items (
        id, product_name, sku_code, options, main_image, quantity, subtotal
      ),
      order_groups!inner (
        recipient_name, recipient_phone, zone_code, address, address_detail,
        delivery_message, payment_method, status, paid_at,
        payments ( method, status, receipt_url )
      ),
      deliveries ( courier, tracking_number, status, shipped_at, tracking_synced_at )
    `
    )
    .eq("seller_id", sellerId)
    .eq("order_number", orderNumber)
    .not(
      "order_groups.status",
      "in",
      `(${UNPAID_ORDER_GROUP_STATUSES.join(",")})`
    )
    .maybeSingle();

  if (error || !data) return null;

  const group = data.order_groups as any;
  const deliveryRaw = data.deliveries as any;
  const delivery = Array.isArray(deliveryRaw)
    ? (deliveryRaw[0] ?? null)
    : (deliveryRaw ?? null);

  return {
    id: data.id,
    order_number: data.order_number,
    status: data.status,
    product_amount: data.product_amount,
    shipping_fee: data.shipping_fee,
    total_amount: data.total_amount,
    created_at: data.created_at,
    items: data.order_items || [],
    order_group: {
      recipient_name: group.recipient_name,
      recipient_phone: group.recipient_phone,
      zone_code: group.zone_code,
      address: group.address,
      address_detail: group.address_detail,
      delivery_message: group.delivery_message,
      payment_method: group.payment_method,
      status: group.status,
      paid_at: group.paid_at,
      payment: group.payments?.[0] ?? null,
    },
    delivery: delivery
      ? {
          courier: delivery.courier,
          tracking_number: delivery.tracking_number,
          status: delivery.status,
          shipped_at: delivery.shipped_at,
          tracking_synced_at: delivery.tracking_synced_at,
        }
      : null,
  };
};

export interface ReturnRequestItem {
  id: string;
  order_number: string;
  product_name: string;
  sku_code: string;
  quantity: number;
  reason: string | null;
  reject_reason: string | null;
  return_approved_at: string | null;
  return_received_at: string | null;
  refunded_at: string | null;
  updated_at: string;
  recipient_name: string;
  recipient_phone: string;
}

// 반품 목록 조회 (판매자별). completed=false(기본)면 진행 중인 건(status='return_requested'),
// completed=true면 최종승인까지 끝난 건(status='returned')만 조회한다.
// 4단계 승인 플로우 중 어디에 있든 status는 return_requested로 유지되다가
// 최종승인 순간에만 returned로 바뀌므로, 완료 내역은 별도 조회가 필요하다.
// refunded_at은 kend 환불 크론 전용 컬럼 — 여기선 표시용으로 읽기만 하고 절대 쓰지 않는다.
export const getSellerReturnRequests = async (
  client: SupabaseClient,
  sellerId: string,
  { completed = false }: { completed?: boolean } = {}
): Promise<ReturnRequestItem[]> => {
  const { data, error } = await client
    .from("delivery_items")
    .select(
      `
      id, reason, reject_reason, return_approved_at, return_received_at, refunded_at, updated_at,
      order_items!inner (
        product_name, sku_code, quantity,
        orders!inner (
          order_number,
          order_groups!inner ( recipient_name, recipient_phone )
        )
      )
    `
    )
    .eq("status", completed ? "returned" : "return_requested")
    .eq("order_items.orders.seller_id", sellerId)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((item: any) => {
    const orderItem = item.order_items;
    const order = orderItem.orders;
    const group = order.order_groups;

    return {
      id: item.id,
      order_number: order.order_number,
      product_name: orderItem.product_name,
      sku_code: orderItem.sku_code,
      quantity: orderItem.quantity,
      reason: item.reason,
      reject_reason: item.reject_reason,
      return_approved_at: item.return_approved_at,
      return_received_at: item.return_received_at,
      refunded_at: item.refunded_at,
      updated_at: item.updated_at,
      recipient_name: group.recipient_name,
      recipient_phone: group.recipient_phone,
    };
  });
};

// 신규(접수대기) 주문 카운트 — 목록 페이지 상단 배지용
export const getNewOrderCount = async (
  client: SupabaseClient,
  sellerId: string
): Promise<number> => {
  const { count, error } = await client
    .from("orders")
    .select("id, order_groups!inner ( status )", {
      count: "exact",
      head: true,
    })
    .eq("seller_id", sellerId)
    .eq("status", "pending")
    .not(
      "order_groups.status",
      "in",
      `(${UNPAID_ORDER_GROUP_STATUSES.join(",")})`
    );

  if (error) throw error;
  return count || 0;
};
