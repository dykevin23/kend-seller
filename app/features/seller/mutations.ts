import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export const setSellerHashtags = async (
  client: SupabaseClient<Database>,
  sellerId: string,
  hashtagIds: string[]
) => {
  const { error: deleteError } = await client
    .from("seller_hashtags")
    .delete()
    .eq("seller_id", sellerId);
  if (deleteError) throw deleteError;

  if (hashtagIds.length > 0) {
    const rows = hashtagIds.map((hashtagId) => ({
      seller_id: sellerId,
      hashtag_id: hashtagId,
    }));
    const { error: insertError } = await client
      .from("seller_hashtags")
      .insert(rows);
    if (insertError) throw insertError;
  }
};

export const createSellerBanner = async (
  client: SupabaseClient<Database>,
  data: {
    seller_id: string;
    title: string;
    image_url: string;
    display_order: number;
  }
) => {
  const { data: result, error } = await client
    .from("seller_banners")
    .insert(data)
    .select("id")
    .single();
  if (error) throw error;
  return result;
};

export const updateSellerBanner = async (
  client: SupabaseClient<Database>,
  bannerId: string,
  data: {
    display_order?: number;
    is_active?: boolean;
  }
) => {
  const { error } = await client
    .from("seller_banners")
    .update(data)
    .eq("id", bannerId);
  if (error) throw error;
};

export const swapBannerOrder = async (
  client: SupabaseClient<Database>,
  bannerIdA: string,
  orderA: number,
  bannerIdB: string,
  orderB: number
) => {
  const { error: errorA } = await client
    .from("seller_banners")
    .update({ display_order: orderB })
    .eq("id", bannerIdA);
  if (errorA) throw errorA;

  const { error: errorB } = await client
    .from("seller_banners")
    .update({ display_order: orderA })
    .eq("id", bannerIdB);
  if (errorB) throw errorB;
};

export const deleteSellerBannerRecord = async (
  client: SupabaseClient<Database>,
  bannerId: string
) => {
  const { error } = await client
    .from("seller_banners")
    .delete()
    .eq("id", bannerId);
  if (error) throw error;
};

// seller_code는 DB Trigger에서 자동 생성됨
export const createSellerInformation = async (
  client: SupabaseClient<Database>,
  {
    bizrNo,
    companyName,
    representativeName,
    zoneCode,
    address,
    addressDetail,
    business,
    domain,
    bankName,
    accountNumber,
    accountHolderName,
    userId,
  }: {
    bizrNo: string;
    companyName: string;
    representativeName: string;
    zoneCode: string;
    address: string;
    addressDetail: string;
    business: string;
    domain: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    userId: string;
  }
) => {
  const { data: sellerData, error: sellerError } = await client
    .from("admin_sellers")
    .insert({
      bizr_no: bizrNo,
      name: companyName,
      representative_name: representativeName,
      zone_code: zoneCode,
      address: address,
      address_detail: addressDetail,
      business: business,
      domain_id: domain,
      bank_name: bankName,
      account_number: accountNumber,
      account_holder_name: accountHolderName,
    })
    .select("id, seller_code")
    .single();

  if (sellerError) throw sellerError;
  const { error: memberError } = await client
    .from("admin_seller_members")
    .insert({
      seller_id: sellerData.id,
      user_id: userId,
    });

  if (memberError) throw memberError;
};

// 반려 후 재제출: 정보 갱신 + 상태를 PENDING으로 리셋
export const updateSellerInformation = async (
  client: SupabaseClient<Database>,
  sellerId: string,
  {
    bizrNo,
    companyName,
    representativeName,
    zoneCode,
    address,
    addressDetail,
    business,
    domain,
    bankName,
    accountNumber,
    accountHolderName,
  }: {
    bizrNo: string;
    companyName: string;
    representativeName: string;
    zoneCode: string;
    address: string;
    addressDetail: string;
    business: string;
    domain: string;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  }
) => {
  const { error } = await client
    .from("admin_sellers")
    .update({
      bizr_no: bizrNo,
      name: companyName,
      representative_name: representativeName,
      zone_code: zoneCode,
      address: address,
      address_detail: addressDetail,
      business: business,
      domain_id: domain,
      bank_name: bankName,
      account_number: accountNumber,
      account_holder_name: accountHolderName,
      status: "PENDING",
      rejection_reason: null,
    })
    .eq("id", sellerId);

  if (error) throw error;
};

// 승인 완료된 판매자의 정산 계좌만 수정 — 사업 정보(재승인 필요)와 달리
// 계좌 변경은 승인 상태에 영향 없음
export const updateSellerBankAccount = async (
  client: SupabaseClient<Database>,
  sellerId: string,
  {
    bankName,
    accountNumber,
    accountHolderName,
  }: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  }
) => {
  const { error } = await client
    .from("admin_sellers")
    .update({
      bank_name: bankName,
      account_number: accountNumber,
      account_holder_name: accountHolderName,
    })
    .eq("id", sellerId);

  if (error) throw error;
};

export const approveSeller = async (
  client: SupabaseClient<Database>,
  sellerId: string
) => {
  const { error } = await client
    .from("admin_sellers")
    .update({ status: "APPROVED", rejection_reason: null })
    .eq("id", sellerId);

  if (error) throw error;
};

export const rejectSeller = async (
  client: SupabaseClient<Database>,
  sellerId: string,
  reason: string
) => {
  const { error } = await client
    .from("admin_sellers")
    .update({ status: "REJECTED", rejection_reason: reason })
    .eq("id", sellerId);

  if (error) throw error;
};
