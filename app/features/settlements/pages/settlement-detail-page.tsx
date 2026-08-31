import { Link, useFetcher, useNavigate } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import Card from "~/common/components/card";
import { Separator } from "~/common/components/ui/separator";
import { Label } from "~/common/components/ui/label";
import { Button } from "~/common/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";
import { useAlert } from "~/hooks/useAlert";
import { formatNumber } from "~/common/utils/format";
import { SETTLEMENT_STATUS_LABELS } from "../constrants";
import type { Route } from "./+types/settlement-detail-page";
import { makeSSRClient } from "~/supa-client";
import { getSettlementDetail, getSettlementLineItems } from "../queries";
import { markSettlementPaid } from "../mutations";

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  return await markSettlementPaid(client, params.settlementId);
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const settlement = await getSettlementDetail(client, params.settlementId);
  if (!settlement) {
    return { settlement: null, lineItems: [] };
  }

  const lineItems = await getSettlementLineItems(client, {
    sellerId: settlement.seller_id,
    periodStart: settlement.period_start,
    periodEnd: settlement.period_end,
  });

  return { settlement, lineItems };
};

export default function SettlementDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const { settlement, lineItems } = loaderData;
  const navigate = useNavigate();
  const { confirm } = useAlert();
  const fetcher = useFetcher();

  if (!settlement) {
    return (
      <Content>
        <Title title="정산 상세" />
        <Card>
          <p className="text-sm text-muted-foreground">
            정산 내역을 찾을 수 없습니다.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/system/settlements">목록으로</Link>
          </Button>
        </Card>
      </Content>
    );
  }

  const isPaid = settlement.status === "paid";

  const handleMarkPaid = () => {
    confirm({
      title: "지급 완료 처리",
      message:
        "계좌이체를 완료하셨나요? 확인을 누르면 이 정산 내역이 지급완료로 표시됩니다.",
      primaryButton: {
        label: "지급 완료",
        onClick: () => {
          fetcher.submit({}, { method: "post" });
        },
      },
      secondaryButton: { label: "취소", onClick: () => {} },
    });
  };

  return (
    <Content className="space-y-4">
      <Title title="정산 상세" />

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {settlement.seller_name} ({settlement.seller_code})
          </h2>
          <span
            className={
              isPaid
                ? "rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400"
                : "rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400"
            }
          >
            {SETTLEMENT_STATUS_LABELS[settlement.status] ?? settlement.status}
          </span>
        </div>
        <div className="mt-3">
          <InfoRow
            label="정산기간"
            value={`${settlement.period_start.slice(0, 10)} ~ ${settlement.period_end.slice(0, 10)}`}
          />
          <Separator />
          <InfoRow
            label="매출액"
            value={`${formatNumber(settlement.total_sales_amount)}원`}
          />
          <Separator />
          <InfoRow
            label="배송비 보전"
            value={`${formatNumber(settlement.shipping_reimbursement)}원`}
          />
          <Separator />
          <InfoRow
            label="수수료율"
            value={`${settlement.commission_rate}%`}
          />
          <Separator />
          <InfoRow
            label="수수료"
            value={`-${formatNumber(settlement.commission_amount)}원`}
          />
          <Separator />
          <InfoRow
            label="정산액"
            value={`${formatNumber(settlement.settlement_amount)}원`}
          />
          {settlement.paid_at && (
            <>
              <Separator />
              <InfoRow
                label="지급일"
                value={settlement.paid_at.slice(0, 10)}
              />
            </>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">주문별 명세</h2>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>주문번호</TableHead>
              <TableHead>상품</TableHead>
              <TableHead className="text-center">수량</TableHead>
              <TableHead className="text-right">판매가</TableHead>
              <TableHead className="text-right">소계</TableHead>
              <TableHead className="text-center">배송비부담</TableHead>
              <TableHead>구매확정일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.length > 0 ? (
              lineItems.map((item, index) => (
                <TableRow key={`${item.order_number}-${index}`}>
                  <TableCell className="py-3">{item.order_number}</TableCell>
                  <TableCell className="py-3">
                    {item.product_name} ({item.sku_code})
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    {formatNumber(item.sale_price)}원
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    {formatNumber(item.subtotal)}원
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    {item.shipping_fee_bearer === "PLATFORM"
                      ? "플랫폼"
                      : "판매자"}
                  </TableCell>
                  <TableCell className="py-3">
                    {item.purchase_confirmed_at?.slice(0, 10) ?? "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  명세가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {fetcher.data?.error && (
        <p className="text-sm text-red-500">{fetcher.data.error}</p>
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => navigate("/system/settlements")}
        >
          목록으로
        </Button>
        {!isPaid && (
          <Button onClick={handleMarkPaid}>지급 완료 처리</Button>
        )}
      </div>
    </Content>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center py-2.5">
      <Label className="w-24 shrink-0 text-muted-foreground">{label}</Label>
      <span className="text-sm">{value}</span>
    </div>
  );
}
