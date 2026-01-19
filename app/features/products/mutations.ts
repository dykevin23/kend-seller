import type { SupabaseClient } from "@supabase/supabase-js";

// 상품 기본정보 생성
export const createProduct = async (
  client: SupabaseClient,
  data: {
    storage_folder: string;
    name: string;
    gender: string;
    domain_id: string;
    main_category: string;
    sub_category: string;
    seller_id: string;
  }
) => {
  // product_code는 DB Trigger에서 자동 생성됨
  const { data: product, error } = await client
    .from("products")
    .insert(data)
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
