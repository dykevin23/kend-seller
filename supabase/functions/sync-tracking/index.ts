// 배송중(shipped/in_transit) 건을 주기적으로 스마트택배 API로 조회해
// deliveries/orders 상태를 갱신한다. pg_cron이 주기 호출한다.
import { createClient } from "npm:@supabase/supabase-js@2";

// courier_company enum → 스마트택배(SweetTracker) t_code
// 출처: GET https://info.sweettracker.co.kr/api/v1/companylist (2026-07 확인)
const COURIER_TO_SWEETTRACKER_CODE: Record<string, string> = {
  POST: "01",
  CJ: "04",
  HANJIN: "05",
  LOGEN: "06",
  LOTTE: "08",
  ILYANG: "11",
  DAESIN: "22",
  KDEXP: "23",
  GSM: "28",
  HDEXP: "32",
};

interface TrackingInfoResponse {
  level?: number;
  complete?: boolean;
  code?: number; // 에러 코드 (101~106)
  msg?: string;
}

// SweetTracker API에 반송(RTS)·장기미수령 전용 상태 코드가 없어(level은 1~6 순방향 진행단계뿐),
// 배송중 상태가 이 기간을 넘겨도 안 끝나면 판매자 수동확인이 필요하다고 본다
const STALLED_IN_TRANSIT_DAYS = 7;

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const sweettrackerKey = Deno.env.get("SWEETTRACKER_API_KEY")!;

  const { data: deliveries, error } = await supabase
    .from("deliveries")
    .select("id, order_id, courier, tracking_number, status, shipped_at")
    .in("status", ["shipped", "in_transit"])
    .not("tracking_number", "is", null);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  const results: Array<{ deliveryId: string; result: string }> = [];

  for (const delivery of deliveries ?? []) {
    const tCode = COURIER_TO_SWEETTRACKER_CODE[delivery.courier ?? ""];
    if (!tCode) {
      results.push({ deliveryId: delivery.id, result: "unknown_courier" });
      continue;
    }

    const url = new URL("https://info.sweettracker.co.kr/api/v1/trackingInfo");
    url.searchParams.set("t_key", sweettrackerKey);
    url.searchParams.set("t_code", tCode);
    url.searchParams.set("t_invoice", delivery.tracking_number!);

    try {
      const res = await fetch(url.toString());
      const body: TrackingInfoResponse = await res.json();

      // 101/102/103/105: 키 자체 문제거나 요청 한도 초과 — 이번 실행 전체를 중단
      if (body.code && [101, 102, 103, 105].includes(body.code)) {
        results.push({ deliveryId: delivery.id, result: `abort:${body.code}` });
        break;
      }

      // 104/106: 이 건만 조회 불가 — 건너뛰고 계속
      if (body.code) {
        results.push({ deliveryId: delivery.id, result: `skip:${body.code}` });
        continue;
      }

      const newStatus = body.complete
        ? "delivered"
        : (body.level ?? 1) > 1
          ? "in_transit"
          : delivery.status;

      const update: Record<string, unknown> = {
        status: newStatus,
        tracking_synced_at: new Date().toISOString(),
      };
      if (body.complete) {
        update.delivered_at = new Date().toISOString();
      }

      await supabase.from("deliveries").update(update).eq("id", delivery.id);

      if (body.complete) {
        await supabase
          .from("orders")
          .update({ status: "delivered" })
          .eq("id", delivery.order_id);
      }

      // SweetTracker에 반송(RTS) 전용 코드가 없어 상태를 강제로 바꾸지 않고,
      // 배송중 상태가 비정상적으로 길게 지속되는 건만 로그로 표시해 수동확인을 유도한다
      // (판매자 화면 배너는 order-detail-page.tsx에서 shipped_at 기준으로 동일하게 계산)
      const stalled =
        newStatus === "in_transit" &&
        !!delivery.shipped_at &&
        Date.now() - new Date(delivery.shipped_at).getTime() >
          STALLED_IN_TRANSIT_DAYS * 24 * 60 * 60 * 1000;

      results.push({
        deliveryId: delivery.id,
        result: stalled ? `${newStatus}:stalled_${STALLED_IN_TRANSIT_DAYS}d+` : newStatus,
      });
    } catch (e) {
      results.push({ deliveryId: delivery.id, result: `error:${String(e)}` });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
