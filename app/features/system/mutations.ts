import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export const createDomain = async (
  client: SupabaseClient<Database>,
  {
    code,
    name,
    useYn,
  }: {
    code: string;
    name: string;
    useYn: string;
  }
) => {
  const { error } = await client.from("domains").insert({
    code: code,
    name: name,
    use_yn: useYn,
  });

  if (error) throw error;
};
