import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export const searchHashtags = async (
  client: SupabaseClient<Database>,
  query: string
) => {
  const { data, error } = await client
    .from("hashtags")
    .select("id, name")
    .ilike("name", `%${query}%`)
    .limit(10);
  if (error) throw error;
  return data || [];
};

export const getDomains = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.from("domains").select("*");

  if (error) throw error;
  return data;
};

export const getAllCommonCodes = async (client: SupabaseClient<Database>) => {
  const { data: groupData, error: groupError } = await client
    .from("common_code_group")
    .select(`id, code, name`);

  if (groupError) throw groupError;

  const { data: codeData, error: codesError } = await client
    .from("common_codes")
    .select(`id, group_id, code, name, use_yn`);
  if (codesError) throw codesError;

  const commonCodegroup = groupData.map((group) => {
    return {
      ...group,
      children: codeData.filter(
        (commonCode) => commonCode.group_id === group.id
      ),
    };
  });

  return commonCodegroup;
};

export const getCategories = async (
  client: SupabaseClient<Database>,
  domainId?: string
) => {
  const baseQuery = client
    .from("main_categories")
    .select(`id, code, name, domain_id`);

  if (typeof domainId === "string") {
    baseQuery.eq("domain_id", domainId);
  }
  const { data: mainCategories, error: mainError } = await baseQuery;
  if (mainError) throw mainError;

  const { data: subCategories, error: subError } = await client
    .from("sub_categories")
    .select(`id, main_category_id, code, name`);
  if (subError) throw subError;

  const result = mainCategories.map((main) => {
    return {
      id: main.id,
      code: main.code,
      name: main.name,
      domainId: main.domain_id,
      children: subCategories
        .filter((sub) => sub.main_category_id === main.id)
        .map((sub) => {
          return {
            id: sub.id,
            code: sub.code,
            name: sub.name,
            mainCategoryId: sub.main_category_id,
          };
        }),
    };
  });

  return result;
};

export const getSystemOptions = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client
    .from("system_options")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;
  return data;
};

export const getSystemOptionById = async (
  client: SupabaseClient<Database>,
  id: string
) => {
  const { data, error } = await client
    .from("system_options")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const getSystemOptionByCode = async (
  client: SupabaseClient<Database>,
  code: string
) => {
  const { data, error } = await client
    .from("system_options")
    .select("*")
    .eq("code", code)
    .single();

  if (error) throw error;
  return data;
};

export const getSystemOptionsByDomain = async (
  client: SupabaseClient<Database>,
  domainId: string
) => {
  const { data, error } = await client
    .from("system_options")
    .select("id, code, name, domain_id")
    .eq("domain_id", domainId)
    .order("id", { ascending: true });

  if (error) throw error;

  return data.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    domainId: item.domain_id,
  }));
};

export const getMainCategoryByCode = async (
  client: SupabaseClient<Database>,
  code: string
) => {
  const { data, error } = await client
    .from("main_categories")
    .select("*")
    .eq("code", code)
    .single();

  if (error) throw error;
  return data;
};

export const getCommonCodeGroupByCode = async (
  client: SupabaseClient<Database>,
  code: string
) => {
  const { data, error } = await client
    .from("common_code_group")
    .select("*")
    .eq("code", code)
    .single();

  if (error) throw error;
  return data;
};
