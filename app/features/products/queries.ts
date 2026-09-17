import type { SupabaseClient } from "@supabase/supabase-js";
import { LOW_STOCK_THRESHOLD } from "./constrants";

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

export interface PlatformCatalogStats {
  totalProducts: number;
  onSale: number;
  soldOut: number;
  lowStockSkus: number;
}

// 관리자 대시보드 "카탈로그 현황" 카드용 — 전체 판매자 합산
export const getPlatformCatalogStats = async (
  client: SupabaseClient
): Promise<PlatformCatalogStats> => {
  const [totalRes, onSaleRes, soldOutRes, lowStockRes] = await Promise.all([
    client.from("products").select("id", { count: "exact", head: true }),
    client
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "SALE"),
    client
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "SOLD_OUT"),
    client
      .from("product_stock_keepings")
      .select("id", { count: "exact", head: true })
      .gt("stock", 0)
      .lte("stock", LOW_STOCK_THRESHOLD),
  ]);

  if (totalRes.error) throw totalRes.error;
  if (onSaleRes.error) throw onSaleRes.error;
  if (soldOutRes.error) throw soldOutRes.error;
  if (lowStockRes.error) throw lowStockRes.error;

  return {
    totalProducts: totalRes.count || 0,
    onSale: onSaleRes.count || 0,
    soldOut: soldOutRes.count || 0,
    lowStockSkus: lowStockRes.count || 0,
  };
};

export interface StockKeepingItem {
  id: string;
  sku_code: string;
  options: Record<string, string> | null;
  stock: number;
  regular_price: number;
  sale_price: number;
  status: string;
  product_id: string;
  product_code: string;
  product_name: string;
}

interface GetStockKeepingsParams {
  sellerId: string;
  status?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}

// SKU별 재고 목록 조회 (판매자 소유 전체 상품, 재고관리 화면용)
export const getSellerStockKeepings = async (
  client: SupabaseClient,
  { sellerId, status, keyword, page = 1, limit = 20 }: GetStockKeepingsParams
): Promise<{ data: StockKeepingItem[]; total: number }> => {
  // PostgREST/Supabase는 조인된(embedded) 테이블 컬럼으로 상위 쿼리 행을
  // 정렬하는 걸 지원하지 않는다(.order(col, {referencedTable})는 중첩
  // 컬렉션 내부 정렬에만 적용되고 부모 행 순서엔 반영 안 됨 — 실측으로 확인:
  // sku_code 텍스트순 그대로 나옴). 그래서 페이지네이션 전에 전량을 가져와
  // JS에서 (상품코드, sku_code) 기준으로 정렬한 뒤 직접 슬라이스한다.
  let query = client
    .from("product_stock_keepings")
    .select(
      `
      id,
      sku_code,
      options,
      stock,
      regular_price,
      sale_price,
      status,
      products!inner (
        id,
        product_code,
        name,
        seller_id
      )
    `
    )
    .eq("products.seller_id", sellerId);

  if (status && status !== "ALL") {
    query = query.eq("status", status);
  }

  // 키워드 검색 — SKU코드는 이 테이블 컬럼이라 바로 ilike 가능하지만, 상품명은
  // 조인 테이블(products) 컬럼이라 같은 .or()에 못 섞는다(PostgREST 제약,
  // orders/queries.ts 2026-07-22 키워드검색 500에러 이력과 동일한 함정) —
  // 상품명으로 먼저 product_id 목록을 구해 이 테이블 컬럼끼리만 .or()로 묶는다
  if (keyword) {
    const { data: matchedProducts } = await client
      .from("products")
      .select("id")
      .eq("seller_id", sellerId)
      .ilike("name", `%${keyword}%`);

    const productIds = (matchedProducts || []).map((p) => p.id);

    if (productIds.length > 0) {
      query = query.or(
        `sku_code.ilike.%${keyword}%,product_id.in.(${productIds.join(",")})`
      );
    } else {
      query = query.ilike("sku_code", `%${keyword}%`);
    }
  }

  const { data, error } = await query;
  if (error) throw error;

  // sku_code("sku-2", "sku-10" ...)는 zero-padding 없는 전역 증가값이라
  // 텍스트 비교로는 sku-10이 sku-2보다 앞에 온다 — 끝자리 숫자를 뽑아
  // 숫자로 비교한다(코드 형식 자체를 바꾸는 대신 정렬만 보정)
  const skuNumber = (skuCode: string) => Number(skuCode.split("-").pop());
  const sorted = (data || []).sort((a: any, b: any) => {
    const productCodeDiff = (a.products.product_code as string).localeCompare(
      b.products.product_code
    );
    if (productCodeDiff !== 0) return productCodeDiff;
    return skuNumber(a.sku_code) - skuNumber(b.sku_code);
  });

  const from = (page - 1) * limit;
  const paged = sorted.slice(from, from + limit);

  const items: StockKeepingItem[] = paged.map((row: any) => ({
    id: row.id,
    sku_code: row.sku_code,
    options: row.options,
    stock: row.stock,
    regular_price: row.regular_price,
    sale_price: row.sale_price,
    status: row.status,
    product_id: row.products.id,
    product_code: row.products.product_code,
    product_name: row.products.name,
  }));

  return { data: items, total: sorted.length };
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
