import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export interface SettlementListItem {
  id: string;
  seller_code: string;
  seller_name: string;
  period_start: string;
  period_end: string;
  total_sales_amount: number;
  shipping_reimbursement: number;
  commission_amount: number;
  settlement_amount: number;
  status: string;
  paid_at: string | null;
}

export const getSettlements = async (
  client: SupabaseClient<Database>,
  { periodStart, status }: { periodStart?: string; status?: string } = {}
): Promise<SettlementListItem[]> => {
  let query = client
    .from("settlement_items")
    .select(
      `
      id, period_start, period_end, total_sales_amount, shipping_reimbursement,
      commission_amount, settlement_amount, status, paid_at,
      admin_sellers ( seller_code, name )
    `
    )
    .order("period_start", { ascending: false });

  if (periodStart) {
    query = query.eq("period_start", periodStart);
  }
  if (status && status !== "ALL") {
    query = query.eq("status", status as "pending" | "paid");
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((item: any) => ({
    id: item.id,
    seller_code: item.admin_sellers?.seller_code ?? "-",
    seller_name: item.admin_sellers?.name ?? "-",
    period_start: item.period_start,
    period_end: item.period_end,
    total_sales_amount: item.total_sales_amount,
    shipping_reimbursement: item.shipping_reimbursement,
    commission_amount: item.commission_amount,
    settlement_amount: item.settlement_amount,
    status: item.status,
    paid_at: item.paid_at,
  }));
};

export interface SettlementDetail {
  id: string;
  seller_id: string;
  seller_code: string;
  seller_name: string;
  bank_name: string | null;
  account_number: string | null;
  account_holder_name: string | null;
  period_start: string;
  period_end: string;
  total_sales_amount: number;
  shipping_reimbursement: number;
  commission_rate: number;
  commission_amount: number;
  settlement_amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
}

export const getSettlementDetail = async (
  client: SupabaseClient<Database>,
  settlementId: string
): Promise<SettlementDetail | null> => {
  const { data, error } = await client
    .from("settlement_items")
    .select(
      `
      id, seller_id, period_start, period_end, total_sales_amount,
      shipping_reimbursement, commission_rate, commission_amount,
      settlement_amount, status, paid_at, created_at,
      admin_sellers ( seller_code, name, bank_name, account_number, account_holder_name )
    `
    )
    .eq("id", settlementId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const seller: any = data.admin_sellers;

  return {
    id: data.id,
    seller_id: data.seller_id,
    seller_code: seller?.seller_code ?? "-",
    seller_name: seller?.name ?? "-",
    bank_name: seller?.bank_name ?? null,
    account_number: seller?.account_number ?? null,
    account_holder_name: seller?.account_holder_name ?? null,
    period_start: data.period_start,
    period_end: data.period_end,
    total_sales_amount: data.total_sales_amount,
    shipping_reimbursement: data.shipping_reimbursement,
    commission_rate: data.commission_rate,
    commission_amount: data.commission_amount,
    settlement_amount: data.settlement_amount,
    status: data.status,
    paid_at: data.paid_at,
    created_at: data.created_at,
  };
};

// 기간 필터 드롭다운용 — 실제 존재하는 정산월 목록만 보여준다
export const getSettlementPeriods = async (
  client: SupabaseClient<Database>
): Promise<string[]> => {
  const { data, error } = await client
    .from("settlement_items")
    .select("period_start")
    .order("period_start", { ascending: false });

  if (error) throw error;

  const periods = Array.from(
    new Set((data || []).map((item) => item.period_start))
  );
  return periods;
};

export interface SettlementLineItem {
  order_number: string;
  product_name: string;
  sku_code: string;
  quantity: number;
  sale_price: number;
  subtotal: number;
  shipping_fee_bearer: string;
  base_shipping_fee: number;
  purchase_confirmed_at: string | null;
}

// 정산 내역에 포함된 주문별 명세 — 별도 테이블 없이 delivery_items를 같은
// 기간·판매자 조건으로 재조회해서 구성한다(settlement_items는 집계값만 저장)
export const getSettlementLineItems = async (
  client: SupabaseClient<Database>,
  {
    sellerId,
    periodStart,
    periodEnd,
  }: { sellerId: string; periodStart: string; periodEnd: string }
): Promise<SettlementLineItem[]> => {
  const periodEndExclusive = new Date(periodEnd);
  periodEndExclusive.setDate(periodEndExclusive.getDate() + 1);

  const { data, error } = await client
    .from("delivery_items")
    .select(
      `
      quantity, purchase_confirmed_at,
      order_items!inner (
        product_name, sku_code, sale_price, shipping_fee_bearer, base_shipping_fee,
        orders!inner ( order_number, seller_id )
      )
    `
    )
    .eq("status", "normal")
    .eq("order_items.orders.seller_id", sellerId)
    .gte("purchase_confirmed_at", periodStart)
    .lt("purchase_confirmed_at", periodEndExclusive.toISOString());

  if (error) throw error;

  return (data || []).map((item: any) => {
    const orderItem = item.order_items;
    return {
      order_number: orderItem.orders.order_number,
      product_name: orderItem.product_name,
      sku_code: orderItem.sku_code,
      quantity: item.quantity,
      sale_price: orderItem.sale_price,
      subtotal: orderItem.sale_price * item.quantity,
      shipping_fee_bearer: orderItem.shipping_fee_bearer,
      base_shipping_fee: orderItem.base_shipping_fee,
      purchase_confirmed_at: item.purchase_confirmed_at,
    };
  });
};
