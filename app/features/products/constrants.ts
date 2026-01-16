export const GENDER_TYPES = [
  { label: "남성", value: "MALE" },
  { label: "여성", value: "FEMALE" },
  { label: "남여공용", value: "UNISEX" },
] as const;

export const SALES_STATUS = [
  { label: "등록", value: "REGISTERED" },
  { label: "준비중", value: "PREPARE" },
  { label: "판매중", value: "SALE" },
  { label: "품절", value: "SOLD_OUT" },
  { label: "판매중지", value: "STOP" },
  { label: "판매종료", value: "END" },
] as const;

export const IMAGE_TYPES = [
  { label: "대표이미지", value: "MAIN" },
  { label: "추가이미지", value: "ADDITIONAL" },
] as const;

export const DESCRIPTION_TYPES = [
  { label: "이미지", value: "IMAGE" },
  { label: "HTML", value: "HTML" },
] as const;

// 제주/도서산간 배송여부
export const ISLAND_DELIVERY_TYPES = [
  { label: "가능", value: "AVAILABLE" },
  { label: "불가능", value: "UNAVAILABLE" },
] as const;

// 배송방법
export const DELIVERY_METHOD_TYPES = [
  { label: "일반배송", value: "STANDARD" },
  { label: "신선냉동", value: "FRESH_FROZEN" },
  { label: "주문제작", value: "CUSTOM_ORDER" },
  { label: "구매대행", value: "PURCHASE_AGENCY" },
  { label: "설치 및 직접배송", value: "INSTALLATION_DIRECT" },
] as const;

// 묶음배송
export const BUNDLE_DELIVERY_TYPES = [
  { label: "가능", value: "AVAILABLE" },
  { label: "불가능", value: "UNAVAILABLE" },
] as const;

// 배송비 종류
export const SHIPPING_FEE_TYPES = [
  { label: "무료배송", value: "FREE" },
  { label: "유료배송", value: "PAID" },
  { label: "착불배송", value: "COD" },
  { label: "조건부배송", value: "CONDITIONAL" },
] as const;

// 택배사
export const COURIER_COMPANIES = [
  { label: "CJ대한통운", value: "CJ" },
  { label: "우체국택배", value: "POST" },
  { label: "한진택배", value: "HANJIN" },
  { label: "로젠택배", value: "LOGEN" },
  { label: "롯데택배", value: "LOTTE" },
  { label: "경동택배", value: "KDEXP" },
  { label: "대신택배", value: "DAESIN" },
  { label: "GSMNtoN", value: "GSM" },
  { label: "일양로지스", value: "ILYANG" },
  { label: "합동택배", value: "HDEXP" },
] as const;
