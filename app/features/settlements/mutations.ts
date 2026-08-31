import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

// pending -> paid 상태 전환 로직을 여기 하나로 분리해둔다. 지금은 관리자가
// 계좌이체 후 수동으로 호출하지만, 나중에 Toss 지급대행이 붙으면 이 함수만
// API 콜백 핸들러에서 호출하도록 교체하면 된다(호출부는 안 바뀜).
export const markSettlementPaid = async (
  client: SupabaseClient<Database>,
  settlementId: string
) => {
  const { data: settlement, error: fetchError } = await client
    .from("settlement_items")
    .select("id, status")
    .eq("id", settlementId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!settlement) {
    return { success: false, error: "정산 내역을 찾을 수 없습니다." };
  }
  if (settlement.status === "paid") {
    return { success: false, error: "이미 지급 완료된 내역입니다." };
  }

  const { error } = await client
    .from("settlement_items")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", settlementId);

  if (error) return { success: false, error: error.message };
  return { success: true };
};
