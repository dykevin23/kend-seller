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
 * DB 시각(timestamptz, UTC)을 한국 날짜 "yyyy-MM-dd"로 변환
 * - 문자열 앞 10자리를 자르면 UTC 날짜가 나와, 한국 시간 0~9시 데이터가 하루 전으로 보인다
 * - 서버(Vercel, UTC)·브라우저 어디서 렌더링해도 같은 결과가 나오도록 시간대를 명시
 */
export const formatKstDate = (value: string): string =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(
    new Date(value)
  );

/**
 * 콤마가 포함된 문자열을 숫자 문자열로 변환
 * @param str - 콤마가 포함된 문자열
 * @returns 콤마가 제거된 숫자 문자열
 */
export const parseNumber = (str: string): string => {
  return str.replace(/,/g, "");
};
