export const ORDER_STATUS = [
  { label: "접수대기", value: "pending" },
  { label: "접수확인", value: "confirmed" },
  { label: "배송준비중", value: "preparing" },
  { label: "배송중", value: "shipped" },
  { label: "배송완료", value: "delivered" },
  { label: "취소", value: "cancelled" },
] as const;

// 판매자가 이 화면에서 일괄/개별로 전환할 수 있는 목표 상태
// (shipped/delivered는 송장입력과 함께 배송 처리 화면에서 다룸)
export const ORDER_STATUS_ACTIONS = [
  { label: "접수확인", value: "confirmed" },
  { label: "배송준비중", value: "preparing" },
  { label: "취소", value: "cancelled" },
] as const;
