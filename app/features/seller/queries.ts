import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export const getSellerHashtags = async (
  client: SupabaseClient<Database>,
  sellerId: string
) => {
  const { data, error } = await client
    .from("seller_hashtags")
    .select("id, hashtag_id, hashtags(id, name)")
    .eq("seller_id", sellerId);
  if (error) throw error;
  return data || [];
};

export const getSellerInfo = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client
    .from("seller_information_view")
    .select("*")
    .maybeSingle();
  if (error) {
    console.error("getSellerInfo error:", error);
    return null;
  }
  return data;
};

export const getSellerBanners = async (
  client: SupabaseClient<Database>,
  sellerId: string
) => {
  const { data, error } = await client
    .from("seller_banners")
    .select("id, title, image_url, display_order, is_active, created_at")
    .eq("seller_id", sellerId)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data || [];
};

// 관리자 승인 화면용: RLS 스코프 없이 전체 판매자 조회
export const getAllSellers = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client
    .from("admin_sellers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getSellerAddresses = async (
  client: SupabaseClient<Database>,
  sellerId: string
) => {
  const { data, error } = await client
    .from("admin_seller_address")
    .select("*")
    .eq("seller_id", sellerId);
  if (error) throw error;
  return data || [];
};
