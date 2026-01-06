import type { CommonCodeGroup } from "~/types/root";

export function useCommonCodes(key: string, codeGroup: CommonCodeGroup[]) {
  return codeGroup.find((group) => group.code === key)?.children || [];
}
