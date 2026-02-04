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
