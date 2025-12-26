import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export const getDomains = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.from("domains").select("*");

  if (error) throw error;
  return data;
};
