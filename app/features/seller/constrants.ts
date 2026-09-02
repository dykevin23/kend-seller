export const ADDRESS_TYPES = [
  { label: "출고지", value: "SHIPPING" },
  { label: "반품지", value: "RETURN" },
] as const;

export const MAX_BANNERS = 5;
export const BANNER_ASPECT_RATIO = "7/3";

export const BUSINESS_TYPES = [
  { label: "브랜드/제조사", value: "MANUFACTURER" },
  { label: "위탁 판매", value: "DROP_SHIPPING" },
  { label: "매입 판매", value: "RESELLER" },
  { label: "해외직구/병행수입", value: "OVERSEAS" },
] as const;

export const SELLER_STATUS = [
  { label: "승인대기", value: "PENDING" },
  { label: "승인", value: "APPROVED" },
  { label: "반려", value: "REJECTED" },
] as const;

// 정산 계좌 은행 목록 — 1원 인증 없이 저장만 하는 단계라 자유 입력 대신
// 드롭다운으로 오탈자를 막는다(실제 송금에 쓰이는 값이라)
export const BANK_LIST = [
  { label: "KB국민은행", value: "KB국민은행" },
  { label: "신한은행", value: "신한은행" },
  { label: "우리은행", value: "우리은행" },
  { label: "하나은행", value: "하나은행" },
  { label: "NH농협은행", value: "NH농협은행" },
  { label: "IBK기업은행", value: "IBK기업은행" },
  { label: "SC제일은행", value: "SC제일은행" },
  { label: "카카오뱅크", value: "카카오뱅크" },
  { label: "토스뱅크", value: "토스뱅크" },
  { label: "케이뱅크", value: "케이뱅크" },
  { label: "새마을금고", value: "새마을금고" },
  { label: "신협", value: "신협" },
  { label: "우체국예금보험", value: "우체국예금보험" },
] as const;
