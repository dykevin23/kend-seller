/**
 * 한국 시간(KST, UTC+9) 기준 날짜 경계 계산
 * - 서버(Vercel)는 UTC로 돌아서 Date의 getDate/setHours/toISOString을 그대로 쓰면
 *   "오늘"이 한국 시간 오전 9시에 시작된다 → 날짜 키·경계를 모두 KST로 계산
 * - 한국은 서머타임이 없어 +9시간 고정
 */

const KST_FORMATTER = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Seoul",
});

/** 시각 → 한국 날짜 키 "yyyy-MM-dd" */
export const toKstDateKey = (value: string | Date): string =>
  KST_FORMATTER.format(new Date(value));

/** 한국 날짜 키 → 그 날 0시(KST)의 UTC ISO 문자열 (DB 조회 범위용) */
export const kstDayStartIso = (dateKey: string): string =>
  new Date(`${dateKey}T00:00:00+09:00`).toISOString();

/** 한국 날짜 키를 n일 이동 */
export const addKstDays = (dateKey: string, days: number): string => {
  const d = new Date(`${dateKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
