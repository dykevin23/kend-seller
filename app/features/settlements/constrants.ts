export const SETTLEMENT_STATUS = [
  { label: "정산대기", value: "pending" },
  { label: "지급완료", value: "paid" },
] as const;

export const SETTLEMENT_STATUS_LABELS: Record<string, string> = {
  pending: "정산대기",
  paid: "지급완료",
};
