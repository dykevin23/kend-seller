/**
 * 숫자를 천단위 콤마 형식으로 변환
 * @param num - 변환할 숫자 또는 문자열
 * @returns 콤마가 포함된 문자열
 */
export const formatNumber = (num: string | number): string => {
  const cleanNum = String(num).replace(/,/g, "");
  if (cleanNum === "" || isNaN(Number(cleanNum))) return "";
  return Number(cleanNum).toLocaleString();
};

/**
 * 콤마가 포함된 문자열을 숫자 문자열로 변환
 * @param str - 콤마가 포함된 문자열
 * @returns 콤마가 제거된 숫자 문자열
 */
export const parseNumber = (str: string): string => {
  return str.replace(/,/g, "");
};
