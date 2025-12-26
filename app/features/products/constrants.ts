export const GENDER_TYPES = [
  { label: "남성", value: "MALE" },
  { label: "여성", value: "FEMALE" },
  { label: "남여공용", value: "UNISEX" },
] as const;

export const SALES_STATUS = [
  { label: "준비중", value: "PREPARE" },
  { label: "판매중", value: "SALE" },
  { label: "품절", value: "SOLD_OUT" },
  { label: "판매중지", value: "STOP" },
  { label: "판매완료", value: "COMPLETE" },
] as const;

export const IMAGE_TYPES = [
  { label: "대표이미지", value: "MAIN" },
  { label: "추가이미지", value: "ADDITIONAL" },
] as const;

export const DESCRIPTION_TYPES = [
  { label: "이미지", value: "IMAGE" },
  { label: "HTML", value: "HTML" },
];
