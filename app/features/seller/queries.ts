import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

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
