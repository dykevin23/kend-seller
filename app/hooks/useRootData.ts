// app/hooks/useRootData.ts
import type { User } from "@supabase/supabase-js";
import { useRouteLoaderData } from "react-router";
import type { loader as rootLoader } from "~/root";
import type { CommonCodeGroup, Profile, Seller } from "~/types/root";

export type RootLoaderData = {
  user: User | null;
  profile: Profile | null;
  seller: Seller | null;
  commonCodes: CommonCodeGroup[];
};

export function useRootData() {
  return useRouteLoaderData<typeof rootLoader>("root") as RootLoaderData;
}
