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

// deliveries.status 라벨 (스마트택배 폴링으로 in_transit/delivered까지 갱신됨)
export const DELIVERY_STATUS_LABELS: Record<string, string> = {
  pending: "배송준비중",
  preparing: "배송준비중",
  shipped: "배송중(발송)",
  in_transit: "배송중",
  delivered: "배송완료",
};

// return_reason_type 라벨 (delivery_items.reason — 구매자 반품 신청 사유)
export const RETURN_REASON_LABELS: Record<string, string> = {
  CHANGE_OF_MIND: "단순변심",
  DEFECT: "상품하자",
  WRONG_ITEM: "오배송",
  DAMAGED: "파손",
  LOST: "분실",
};

// 송장번호 형식 sanity check — 택배사별 정확한 자릿수 규격까진 확보 못해
// 하이픈/공백 제거 후 숫자 8~20자리인지 정도만 확인해 명백한 오입력(문자 섞임, 너무 짧음)만 거른다
const TRACKING_NUMBER_PATTERN = /^\d{8,20}$/;

export const normalizeTrackingNumber = (value: string) => value.replace(/[\s-]/g, "");

export const isValidTrackingNumber = (value: string) =>
  TRACKING_NUMBER_PATTERN.test(normalizeTrackingNumber(value));

// courier_company enum → 스마트택배(SweetTracker) t_code 매핑
// 출처: GET https://info.sweettracker.co.kr/api/v1/companylist (2026-07 확인)
export const COURIER_TO_SWEETTRACKER_CODE: Record<string, string> = {
  POST: "01",
  CJ: "04",
  HANJIN: "05",
  LOGEN: "06",
  LOTTE: "08",
  ILYANG: "11",
  DAESIN: "22",
  KDEXP: "23",
  GSM: "28",
  HDEXP: "32",
};
