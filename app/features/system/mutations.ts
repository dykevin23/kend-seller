import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

// 플랫폼 전역 설정(싱글턴) 갱신 — row가 없으면 생성, 있으면 갱신
export const updatePlatformSettings = async (
  client: SupabaseClient<Database>,
  {
    freeShippingThreshold,
    commissionRate,
  }: { freeShippingThreshold: number; commissionRate: number }
) => {
  const { data: existing, error: fetchError } = await client
    .from("platform_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (!existing) {
    const { error } = await client.from("platform_settings").insert({
      free_shipping_threshold: freeShippingThreshold,
      commission_rate: commissionRate,
    });
    if (error) throw error;
    return;
  }

  const { error } = await client
    .from("platform_settings")
    .update({
      free_shipping_threshold: freeShippingThreshold,
      commission_rate: commissionRate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id);

  if (error) throw error;
};

export const createHashtag = async (
  client: SupabaseClient<Database>,
  name: string
) => {
  const { data: existing } = await client
    .from("hashtags")
    .select("id, name")
    .eq("name", name)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await client
    .from("hashtags")
    .insert({ name })
    .select("id, name")
    .single();
  if (error) throw error;
  return data;
};

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
