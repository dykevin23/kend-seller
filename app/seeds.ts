export const classifications = [
  { rownum: 1, code: "FASHION", name: "패션/의류", useYn: "Y" },
  { rownum: 2, code: "SKINCARE", name: "스킨케어", useYn: "Y" },
  { rownum: 3, code: "ACTIVITY", name: "액티비티", useYn: "Y" },
  { rownum: 4, code: "LIFE", name: "라이프", useYn: "N" },
];

export const option_groups = [
  {
    id: "optionGroup1",
    classification: "FASHION",
    group_key: "SIZE",
    group_name: "사이즈",
  },
  {
    id: "optionGroup2",
    classification: "FASHION",
    group_key: "COLOR",
    group_name: "색상",
  },
];

export const option_values = [
  {
    id: "optionValue1",
    group_id: "optionGroup1",
    value: "large",
    name: "L",
  },
  {
    id: "optionValue2",
    group_id: "optionGroup1",
    value: "medium",
    name: "M",
  },
  {
    id: "optionValue3",
    group_id: "optionGroup1",
    value: "small",
    name: "S",
  },
  {
    id: "optionValue4",
    group_id: "optionGroup2",
    value: "#ef4444",
    name: "RED",
  },
  {
    id: "optionValue5",
    group_id: "optionGroup2",
    value: "#eab308",
    name: "YELLOW",
  },
];
