export function useCommonCodes(key: string, codes: any) {
  return codes.find((code) => code.code === key).children;
}
