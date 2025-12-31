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

export const createCommonCodeGroup = async (
  client: SupabaseClient<Database>,
  {
    code,
    name,
  }: {
    code: string;
    name: string;
  }
) => {
  const { data, error } = await client
    .from("common_code_group")
    .insert({ code: code, name: name });

  if (error) throw error;
};

export const createCommonCode = async (
  client: SupabaseClient<Database>,
  {
    group_id,
    code,
    name,
  }: {
    group_id: string;
    code: string;
    name: string;
  }
) => {
  const { data, error } = await client
    .from("common_codes")
    .insert({
      code: code,
      name: name,
      group_code: Number(group_id),
      use_yn: "Y",
    });

  if (error) throw error;
};
