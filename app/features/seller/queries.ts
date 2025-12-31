import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export const getIsEnrollSeller = async (
  client: SupabaseClient<Database>,
  userId: string
) => {
  const { count, error } = await client
    .from("admin_seller_members")
    .select("seller_id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;

  if (count) {
    return count > 0;
  } else {
    return false;
  }
};
