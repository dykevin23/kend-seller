import type { SupabaseClient } from "@supabase/supabase-js";

export interface ProductListItem {
  id: string;
  product_code: string;
  name: string;
  status: string;
  created_at: string;
  // SKU 정보 (집계)
  min_sale_price: number | null;
  max_sale_price: number | null;
  total_stock: number | null;
}

interface GetProductsParams {
  sellerId: string;
  status?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}

// 상품 목록 조회 (판매자별)
export const getProducts = async (
  client: SupabaseClient,
  { sellerId, status, keyword, page = 1, limit = 10 }: GetProductsParams
): Promise<{ data: ProductListItem[]; total: number }> => {
  // 기본 쿼리 - products 테이블에서 조회
  let query = client
    .from("products")
    .select(
      `
      id,
      product_code,
      name,
      status,
      created_at,
      product_stock_keepings (
        sale_price,
        stock
      )
    `,
      { count: "exact" }
    )
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  // 상태 필터
  if (status && status !== "ALL") {
    query = query.eq("status", status);
  }

  // 키워드 검색
  if (keyword) {
    query = query.ilike("name", `%${keyword}%`);
  }

  // 페이지네이션
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  // SKU 정보 집계
  const products: ProductListItem[] = (data || []).map((product: any) => {
    const skus = product.product_stock_keepings || [];
    const prices = skus.map((s: any) => s.sale_price).filter((p: number) => p != null);
    const stocks = skus.map((s: any) => s.stock).filter((s: number) => s != null);

    return {
      id: product.id,
      product_code: product.product_code,
      name: product.name,
      status: product.status,
      created_at: product.created_at,
      min_sale_price: prices.length > 0 ? Math.min(...prices) : null,
      max_sale_price: prices.length > 0 ? Math.max(...prices) : null,
      total_stock: stocks.length > 0 ? stocks.reduce((a: number, b: number) => a + b, 0) : null,
    };
  });

  return {
    data: products,
    total: count || 0,
  };
};
