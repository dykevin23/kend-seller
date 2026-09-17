// 공지사항 노출 대상 — SELLER: kend-seller 판매자, BUYER: kend(구매자 앱), ALL: 양쪽 다
export const NOTICE_TARGETS = [
  { label: "전체", value: "ALL" },
  { label: "판매자", value: "SELLER" },
  { label: "구매자(kend)", value: "BUYER" },
] as const;

export const NOTICE_TARGET_LABELS: Record<string, string> = {
  ALL: "전체",
  SELLER: "판매자",
  BUYER: "구매자(kend)",
};
