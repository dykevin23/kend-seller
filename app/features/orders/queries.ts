import type { SupabaseClient } from "@supabase/supabase-js";

// 판매자에게 노출 가능한 order_group 상태 (결제 완료된 건만)
// payment_in_progress/payment_pending/failed는 결제 미완료 상태라 제외
const PAID_ORDER_GROUP_STATUSES = ["paid", "partially_refunded"];

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
      order_items ( product_name, quantity )
    `,
      { count: "exact" }
    )
    .eq("seller_id", sellerId)
    .in("order_groups.status", PAID_ORDER_GROUP_STATUSES)
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
      deliveries ( courier, tracking_number, status, tracking_synced_at )
    `
    )
    .eq("seller_id", sellerId)
    .eq("order_number", orderNumber)
    .in("order_groups.status", PAID_ORDER_GROUP_STATUSES)
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
          tracking_synced_at: delivery.tracking_synced_at,
        }
      : null,
  };
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
    .in("order_groups.status", PAID_ORDER_GROUP_STATUSES);

  if (error) throw error;
  return count || 0;
};
