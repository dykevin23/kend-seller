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
  const { data, error } = await client.from("common_codes").insert({
    code: code,
    name: name,
    group_id: group_id,
    use_yn: "Y",
  });

  if (error) throw error;
};

export const createMainCategory = async (
  client: SupabaseClient<Database>,
  { domainId, code, name }: { domainId: string; code: string; name: string }
) => {
  const { data, error } = await client
    .from("main_categories")
    .insert({
      domain_id: domainId,
      code: code,
      name: name,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
};

export const createSubCategory = async (
  client: SupabaseClient<Database>,
  { categoryId, code, name }: { categoryId: string; code: string; name: string }
) => {
  const { error } = await client.from("sub_categories").insert({
    main_category_id: categoryId,
    code: code,
    name: name,
  });

  if (error) throw error;
};

export const createSystemOption = async (
  client: SupabaseClient<Database>,
  {
    domainId,
    code,
    name,
  }: {
    domainId?: string;
    code: string;
    name: string;
  }
) => {
  const { error } = await client.from("system_options").insert({
    domain_id: domainId ?? null,
    code: code,
    name: name,
  });

  if (error) throw error;
};

export const updateSystemOption = async (
  client: SupabaseClient<Database>,
  {
    id,
    domainId,
    code,
    name,
  }: {
    id: string;
    domainId?: string;
    code: string;
    name: string;
  }
) => {
  const { error } = await client
    .from("system_options")
    .update({
      domain_id: domainId ?? null,
      code: code,
      name: name,
    })
    .eq("id", id);

  if (error) throw error;
};
