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

// product_code로 product_id 조회
export const getProductIdByCode = async (
  client: SupabaseClient,
  productCode: string,
  sellerId: string
): Promise<string | null> => {
  const { data, error } = await client
    .from("products")
    .select("id")
    .eq("product_code", productCode)
    .eq("seller_id", sellerId)
    .single();

  if (error || !data) return null;
  return data.id;
};

// 상품 상세 정보 인터페이스
export interface ProductDetail {
  id: string;
  product_code: string;
  storage_folder: string;
  name: string;
  status: string;
  target_gender: string;
  target_age: string;
  domain_id: string;
  main_category: string;
  sub_category: string;
  created_at: string;
  // 상세정보
  detail: {
    brand: string | null;
    maker: string | null;
  } | null;
  // SKU 정보
  stock_keepings: Array<{
    id: string;
    sku_code: string;
    options: Record<string, string> | null;
    stock: number;
    regular_price: number;
    sale_price: number;
    status: string;
  }>;
  // 옵션 정보
  options: Array<{
    id: string;
    system_option_id: string;
    option: string;
    system_option: {
      code: string;
      name: string;
    };
  }>;
  // 이미지 정보
  images: Array<{
    id: string;
    type: string;
    url: string;
    sku_id: string | null;
  }>;
  // 상세설명 이미지
  descriptions: Array<{
    id: string;
    type: string;
    content: string;
  }>;
  // 배송정보
  delivery: {
    address_id: string;
    island_delivery: string;
    courier_company: string;
    delivery_method: string;
    bundle_delivery: string;
    shipping_fee_type: string;
    shipping_fee: number;
    free_shipping_condition: number;
    shipping_days: number;
  } | null;
  // 반품정보
  return_info: {
    address_id: string;
    initial_shipping_fee: number;
    return_shipping_fee: number;
  } | null;
}

// 상품 상세 조회
export const getProductById = async (
  client: SupabaseClient,
  productId: string,
  sellerId: string
): Promise<ProductDetail | null> => {
  const { data, error } = await client
    .from("products")
    .select(
      `
      id,
      product_code,
      storage_folder,
      name,
      status,
      target_gender,
      target_age,
      domain_id,
      main_category,
      sub_category,
      created_at,
      product_details (
        brand,
        maker
      ),
      product_stock_keepings (
        id,
        sku_code,
        options,
        stock,
        regular_price,
        sale_price,
        status
      ),
      product_options (
        id,
        system_option_id,
        option,
        system_options (
          code,
          name
        )
      ),
      product_images (
        id,
        type,
        url,
        sku_id
      ),
      product_descriptions (
        id,
        type,
        content
      ),
      product_deliveries (
        address_id,
        island_delivery,
        courier_company,
        delivery_method,
        bundle_delivery,
        shipping_fee_type,
        shipping_fee,
        free_shipping_condition,
        shipping_days
      ),
      product_returns (
        address_id,
        initial_shipping_fee,
        return_shipping_fee
      )
    `
    )
    .eq("id", productId)
    .eq("seller_id", sellerId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    product_code: data.product_code,
    storage_folder: data.storage_folder,
    name: data.name,
    status: data.status,
    target_gender: data.target_gender,
    target_age: data.target_age,
    domain_id: data.domain_id,
    main_category: data.main_category,
    sub_category: data.sub_category,
    created_at: data.created_at,
    detail: data.product_details?.[0] || null,
    stock_keepings: data.product_stock_keepings || [],
    options: (data.product_options || []).map((opt: any) => ({
      id: opt.id,
      system_option_id: opt.system_option_id,
      option: opt.option,
      system_option: opt.system_options,
    })),
    images: data.product_images || [],
    descriptions: data.product_descriptions || [],
    delivery: data.product_deliveries?.[0] || null,
    return_info: data.product_returns?.[0] || null,
  };
};
