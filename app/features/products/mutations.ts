import type { SupabaseClient } from "@supabase/supabase-js";

// 상품 기본정보 생성
export const createProduct = async (
  client: SupabaseClient,
  data: {
    storage_folder: string;
    name: string;
    target_gender: string;
    target_age: string;
    domain_id: string;
    main_category: string;
    sub_category: string;
    seller_id: string;
  }
) => {
  // product_code는 DB Trigger에서 자동 생성됨. status는 등록 완료 시
  // 바로 PREPARE로 시작한다 — REGISTERED는 등록 미완료(임시저장) 전용
  // 상태로 남겨두고, 이 함수를 거치는 등록은 항상 완료된 등록이므로
  // 여기서 고정으로 명시한다(호출부에서 깜빡해도 안전하도록)
  const { data: product, error } = await client
    .from("products")
    .insert({ ...data, status: "PREPARE" })
    .select("id, product_code")
    .single();

  if (error) throw error;
  return product.id;
};

// 상품 상세정보 생성
export const createProductDetail = async (
  client: SupabaseClient,
  data: {
    product_id: string;
    brand: string | null;
    maker: string;
  }
) => {
  const { error } = await client.from("product_details").insert(data);
  if (error) throw error;
};

// 상품 옵션 생성 (bulk insert)
export const createProductOptions = async (
  client: SupabaseClient,
  options: Array<{
    product_id: string;
    system_option_id: string;
    option: string;
  }>
) => {
  if (options.length === 0) return;

  const { error } = await client.from("product_options").insert(options);
  if (error) throw error;
};

// 상품 재고/가격 정보 생성 (bulk insert)
// sku_code는 DB Trigger에서 자동 생성됨
export const createProductStockKeepings = async (
  client: SupabaseClient,
  stockKeepings: Array<{
    product_id: string;
    options: Record<string, string>;
    stock: number;
    regular_price: number;
    sale_price: number;
    status: string;
  }>
) => {
  if (stockKeepings.length === 0) return [];

  const { data, error } = await client
    .from("product_stock_keepings")
    .insert(stockKeepings)
    .select("id, sku_code");

  if (error) throw error;
  return data;
};

// 상품 이미지 생성 (bulk insert)
export const createProductImages = async (
  client: SupabaseClient,
  images: Array<{
    product_id: string;
    sku_id?: string | null;
    type: string;
    url: string;
  }>
) => {
  if (images.length === 0) return;

  const { error } = await client.from("product_images").insert(images);
  if (error) throw error;
};

// 상품 설명 생성 (bulk insert)
export const createProductDescriptions = async (
  client: SupabaseClient,
  descriptions: Array<{
    product_id: string;
    type: string;
    content: string;
  }>
) => {
  if (descriptions.length === 0) return;

  const { error } = await client.from("product_descriptions").insert(descriptions);
  if (error) throw error;
};

// 상품 배송정보 생성
export const createProductDelivery = async (
  client: SupabaseClient,
  data: {
    product_id: string;
    address_id: string;
    island_delivery: string;
    courier_company: string;
    delivery_method: string;
    bundle_delivery: string;
    shipping_fee_type: string;
    shipping_fee: number;
    free_shipping_condition: number;
    shipping_days: number;
  }
) => {
  const { error } = await client.from("product_deliveries").insert(data);
  if (error) throw error;
};

// 상품 반품/교환 정보 생성
export const createProductReturn = async (
  client: SupabaseClient,
  data: {
    product_id: string;
    address_id: string;
    initial_shipping_fee: number;
    return_shipping_fee: number;
  }
) => {
  const { error } = await client.from("product_returns").insert(data);
  if (error) throw error;
};

// 상품 기본정보 수정
export const updateProduct = async (
  client: SupabaseClient,
  productId: string,
  data: {
    name: string;
    target_gender: string;
    target_age: string;
    domain_id: string;
    main_category: string;
    sub_category: string;
  }
) => {
  const { error } = await client.from("products").update(data).eq("id", productId);
  if (error) throw error;
};

// 상품 상세정보 수정 (등록 시 항상 1건 생성되므로 이미 존재한다고 가정)
export const updateProductDetail = async (
  client: SupabaseClient,
  productId: string,
  data: { brand: string | null; maker: string }
) => {
  const { error } = await client
    .from("product_details")
    .update(data)
    .eq("product_id", productId);
  if (error) throw error;
};

// 상품 이미지 교체 — 대표/추가 이미지는 다른 테이블에서 FK로 참조하지
// 않아 삭제 후 재삽입이 안전함(sku_id가 있는 SKU별 이미지는 건드리지 않음)
export const replaceProductImages = async (
  client: SupabaseClient,
  productId: string,
  images: Array<{ type: string; url: string }>
) => {
  const { error: deleteError } = await client
    .from("product_images")
    .delete()
    .eq("product_id", productId)
    .is("sku_id", null);
  if (deleteError) throw deleteError;

  if (images.length === 0) return;

  const { error } = await client
    .from("product_images")
    .insert(images.map((img) => ({ product_id: productId, sku_id: null, ...img })));
  if (error) throw error;
};

// 상품 상세설명 교체 — 다른 테이블에서 참조하지 않아 삭제 후 재삽입 안전
export const replaceProductDescriptions = async (
  client: SupabaseClient,
  productId: string,
  descriptions: Array<{ type: string; content: string }>
) => {
  const { error: deleteError } = await client
    .from("product_descriptions")
    .delete()
    .eq("product_id", productId);
  if (deleteError) throw deleteError;

  if (descriptions.length === 0) return;

  const { error } = await client
    .from("product_descriptions")
    .insert(descriptions.map((desc) => ({ product_id: productId, ...desc })));
  if (error) throw error;
};

// 상품 배송정보 수정 (등록 시 항상 1건 생성되므로 이미 존재한다고 가정)
export const updateProductDelivery = async (
  client: SupabaseClient,
  productId: string,
  data: {
    address_id: string;
    island_delivery: string;
    courier_company: string;
    delivery_method: string;
    bundle_delivery: string;
    shipping_fee_type: string;
    shipping_fee: number;
    free_shipping_condition: number;
    shipping_days: number;
  }
) => {
  const { error } = await client
    .from("product_deliveries")
    .update(data)
    .eq("product_id", productId);
  if (error) throw error;
};

// 상품 반품/교환 정보 수정 (등록 시 항상 1건 생성되므로 이미 존재한다고 가정)
export const updateProductReturn = async (
  client: SupabaseClient,
  productId: string,
  data: {
    address_id: string;
    initial_shipping_fee: number;
    return_shipping_fee: number;
  }
) => {
  const { error } = await client
    .from("product_returns")
    .update(data)
    .eq("product_id", productId);
  if (error) throw error;
};

// 상품 상태 변경
export const updateProductStatus = async (
  client: SupabaseClient,
  productId: string,
  status: string
) => {
  const { error } = await client
    .from("products")
    .update({ status })
    .eq("id", productId);

  if (error) throw error;
};

// 상품 상태 일괄 변경 — SKU 상태는 더 이상 함께 바꾸지 않는다. 상품
// 상태(판매 의도)와 SKU 상태(옵션별 구매가능 여부)는 별개 개념으로 분리
// 했고(2026-09 상품/SKU 상태 모델 정리), 여기서 SKU까지 같은 값으로
// 덮어쓰면 예를 들어 상품을 SALE로 바꿀 때 개별적으로 STOP/SOLD_OUT
// 처리해둔 SKU까지 강제로 SALE이 되어버리는 문제가 있었다. SKU 상태는
// 별도 재고관리 화면에서 다룬다.
export const updateProductsStatus = async (
  client: SupabaseClient,
  productIds: string[],
  status: string,
  sellerId: string
) => {
  const { error } = await client
    .from("products")
    .update({ status })
    .in("id", productIds)
    .eq("seller_id", sellerId);

  if (error) throw error;
};

// SKU 상태 변경
export const updateSKUStatus = async (
  client: SupabaseClient,
  skuId: string,
  status: string
) => {
  const { error } = await client
    .from("product_stock_keepings")
    .update({ status })
    .eq("id", skuId);

  if (error) throw error;
};
