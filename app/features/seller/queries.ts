import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export const getSellerInfo = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client
    .from("seller_information_view")
    .select("*")
    .single();
  if (error) throw error;
  return data;
};
