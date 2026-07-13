export type Profile = {
  profile_id: string;
  nickname: string;
  username: string;
  avatar: string | null;
  introduction: string | null;
  comment: string | null;
  role: "customer" | "seller" | "administrator";
};

export type Seller = {
  address: string;
  address_detail: string;
  bizr_no: string;
  business: string;
  created_at: string;
  domain_id: string;
  domain_name: string;
  id: string;
  name: string;
  representative_name: string;
  seller_code: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason: string | null;
  updated_at: string;
  zone_code: string;
};

export type CommonCode = {
  id: number;
  group_code: number | null;
  code: string;
  name: string;
  use_yn: string;
};

export type CommonCodeGroup = {
  children: CommonCode[];
  id: number;
  code: string;
  name: string;
};
