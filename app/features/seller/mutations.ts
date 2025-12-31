import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

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
      domain_id: Number(domain),
    })
    .select("id")
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
