import type { SupabaseClient } from "@supabase/supabase-js";

// order_item_id가 null인 문의(상품과 무관한 일반 문의)는 admin 전용이라
// order_items!inner 조인으로 자연히 목록에서 제외된다.

export interface InquiryListItem {
  id: string;
  category: string;
  title: string;
  status: string;
  created_at: string;
  order_number: string;
  product_name: string;
}

export const getSellerInquiries = async (
  client: SupabaseClient,
  sellerId: string,
  { status, category }: { status?: string; category?: string } = {}
): Promise<InquiryListItem[]> => {
  let query = client
    .from("inquiries")
    .select(
      `
      id, category, title, status, created_at,
      order_items!inner (
        product_name,
        orders!inner ( order_number )
      )
    `
    )
    .eq("order_items.orders.seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (status && status !== "ALL") {
    query = query.eq("status", status);
  }
  if (category && category !== "ALL") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((item: any) => {
    const orderItem = item.order_items;
    return {
      id: item.id,
      category: item.category,
      title: item.title,
      status: item.status,
      created_at: item.created_at,
      order_number: orderItem?.orders?.order_number ?? "-",
      product_name: orderItem?.product_name ?? "-",
    };
  });
};

export interface InquiryDetail {
  id: string;
  category: string;
  title: string;
  content: string;
  status: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
  order_number: string;
  product_name: string;
  writer_nickname: string;
}

export const getSellerInquiryDetail = async (
  client: SupabaseClient,
  { sellerId, inquiryId }: { sellerId: string; inquiryId: string }
): Promise<InquiryDetail | null> => {
  const { data, error } = await client
    .from("inquiries")
    .select(
      `
      id, category, title, content, status, answer, answered_at, created_at,
      order_items!inner (
        product_name,
        orders!inner ( order_number, seller_id )
      ),
      profiles ( nickname )
    `
    )
    .eq("id", inquiryId)
    .eq("order_items.orders.seller_id", sellerId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const orderItem: any = data.order_items;
  const profile: any = data.profiles;

  return {
    id: data.id,
    category: data.category,
    title: data.title,
    content: data.content,
    status: data.status,
    answer: data.answer,
    answered_at: data.answered_at,
    created_at: data.created_at,
    order_number: orderItem?.orders?.order_number ?? "-",
    product_name: orderItem?.product_name ?? "-",
    writer_nickname: profile?.nickname ?? "-",
  };
};

// 일반 문의(order_item_id가 null — 특정 상품/판매자와 무관) — admin 전용
export interface AdminInquiryListItem {
  id: string;
  category: string;
  title: string;
  status: string;
  created_at: string;
  writer_nickname: string;
}

export const getAdminGeneralInquiries = async (
  client: SupabaseClient,
  { status, category }: { status?: string; category?: string } = {}
): Promise<AdminInquiryListItem[]> => {
  let query = client
    .from("inquiries")
    .select(
      `
      id, category, title, status, created_at,
      profiles ( nickname )
    `
    )
    .is("order_item_id", null)
    .order("created_at", { ascending: false });

  if (status && status !== "ALL") {
    query = query.eq("status", status);
  }
  if (category && category !== "ALL") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((item: any) => ({
    id: item.id,
    category: item.category,
    title: item.title,
    status: item.status,
    created_at: item.created_at,
    writer_nickname: item.profiles?.nickname ?? "-",
  }));
};

export interface AdminInquiryDetail {
  id: string;
  category: string;
  title: string;
  content: string;
  status: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
  writer_nickname: string;
}

export const getAdminInquiryDetail = async (
  client: SupabaseClient,
  inquiryId: string
): Promise<AdminInquiryDetail | null> => {
  const { data, error } = await client
    .from("inquiries")
    .select(
      `
      id, category, title, content, status, answer, answered_at, created_at,
      profiles ( nickname )
    `
    )
    .eq("id", inquiryId)
    .is("order_item_id", null)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const profile: any = data.profiles;

  return {
    id: data.id,
    category: data.category,
    title: data.title,
    content: data.content,
    status: data.status,
    answer: data.answer,
    answered_at: data.answered_at,
    created_at: data.created_at,
    writer_nickname: profile?.nickname ?? "-",
  };
};
