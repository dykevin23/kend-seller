export const ADDRESS_TYPES = [
  { label: "출고지", value: "SHIPPING" },
  { label: "반품지", value: "RETURN" },
] as const;

export const BUSINESS_TYPES = [
  { label: "브랜드/제조사", value: "MANUFACTURER" },
  { label: "위탁 판매", value: "DROP_SHIPPING" },
  { label: "매입 판매", value: "RESELLER" },
  { label: "해외직구/병행수입", value: "OVERSEAS" },
] as const;
