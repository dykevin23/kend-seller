import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export const getUserById = async (
  client: SupabaseClient<Database>,
  { id }: { id: string }
) => {
  const { data, error } = await client
    .from("profiles")
    .select(
      `
        profile_id,
        nickname,
        username,
        avatar,
        introduction,
        comment,
        role
      `
    )
    .eq("role", "seller")
    .eq("profile_id", id)
    .single();

  if (error) throw error;
  return data;
};
