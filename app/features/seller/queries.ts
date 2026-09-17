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
export const getAllSellers = async (
  client: SupabaseClient<Database>,
  { status }: { status?: string } = {}
) => {
  let query = client
    .from("admin_sellers")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "ALL") {
    query = query.eq("status", status as "PENDING" | "APPROVED" | "REJECTED");
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

// 사이드바 배지용 — 매 페이지 로드마다 호출되므로 가벼운 count 쿼리로 분리
export const getPendingSellerCount = async (
  client: SupabaseClient<Database>
): Promise<number> => {
  const { count, error } = await client
    .from("admin_sellers")
    .select("id", { count: "exact", head: true })
    .eq("status", "PENDING");
  if (error) throw error;
  return count || 0;
};

export interface SellerStatusCounts {
  pending: number;
  approved: number;
  rejected: number;
}

// 관리자 대시보드 "판매자 현황" 카드용
export const getSellerStatusCounts = async (
  client: SupabaseClient<Database>
): Promise<SellerStatusCounts> => {
  const { data, error } = await client.from("admin_sellers").select("status");
  if (error) throw error;

  const counts: SellerStatusCounts = { pending: 0, approved: 0, rejected: 0 };
  for (const row of data || []) {
    if (row.status === "PENDING") counts.pending += 1;
    else if (row.status === "APPROVED") counts.approved += 1;
    else if (row.status === "REJECTED") counts.rejected += 1;
  }
  return counts;
};

// 관리자 대시보드 "이번달 신규 판매자" KPI용
export const getSellerSignupCountThisMonth = async (
  client: SupabaseClient<Database>
): Promise<number> => {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count, error } = await client
    .from("admin_sellers")
    .select("id", { count: "exact", head: true })
    .gte("created_at", monthStart.toISOString());
  if (error) throw error;
  return count || 0;
};

export const getSellerAddresses = async (
  client: SupabaseClient<Database>,
  sellerId: string
) => {
  const { data, error } = await client
    .from("admin_seller_address")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
};
