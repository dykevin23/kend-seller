import { Link, useNavigate } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import Card from "~/common/components/card";
import { Separator } from "~/common/components/ui/separator";
import { Label } from "~/common/components/ui/label";
import { Button } from "~/common/components/ui/button";
import { Badge } from "~/common/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";
import { formatNumber } from "~/common/utils/format";
import { SETTLEMENT_STATUS_LABELS } from "../constrants";
import type { Route } from "./+types/seller-settlement-detail-page";
import { makeSSRClient } from "~/supa-client";
import { getSellerSettlementDetail, getSettlementLineItems } from "../queries";
import { getSellerInfo } from "~/features/seller/queries";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const seller = await getSellerInfo(client);
  if (!seller) {
    return { settlement: null, lineItems: [] };
  }

  const settlement = await getSellerSettlementDetail(client, {
    sellerId: seller.id,
    settlementId: params.settlementId,
  });
  if (!settlement) {
    return { settlement: null, lineItems: [] };
  }

  const lineItems = await getSettlementLineItems(client, {
    sellerId: seller.id,
    periodStart: settlement.period_start,
    periodEnd: settlement.period_end,
  });

  return { settlement, lineItems };
};

export default function SellerSettlementDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const { settlement, lineItems } = loaderData;
  const navigate = useNavigate();

  if (!settlement) {
    return (
      <Content>
        <Title title="정산 상세" />
        <Card>
          <p className="text-sm text-muted-foreground">
            정산 내역을 찾을 수 없습니다.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/seller/settlements">목록으로</Link>
          </Button>
        </Card>
      </Content>
    );
  }

  const isPaid = settlement.status === "paid";

  return (
    <Content className="space-y-4">
      <Title title="정산 상세" />

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {settlement.period_start.slice(0, 7)} 정산
          </h2>
          <Badge variant={isPaid ? "success" : "warning"}>
            {SETTLEMENT_STATUS_LABELS[settlement.status] ?? settlement.status}
          </Badge>
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
          <InfoRow label="수수료율" value={`${settlement.commission_rate}%`} />
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
              <InfoRow label="지급일" value={settlement.paid_at.slice(0, 10)} />
            </>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">지급 계좌</h2>
        {settlement.bank_name && settlement.account_number ? (
          <div className="mt-3">
            <InfoRow label="은행" value={settlement.bank_name} />
            <Separator />
            <InfoRow label="계좌번호" value={settlement.account_number} />
            <Separator />
            <InfoRow
              label="예금주명"
              value={settlement.account_holder_name ?? "-"}
            />
          </div>
        ) : (
          <p className="mt-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            등록된 정산 계좌가 없습니다. 판매자 프로필에서 계좌를 등록해주세요.
          </p>
        )}
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
                    {item.shipping_fee_bearer === "PLATFORM" ? "플랫폼" : "판매자"}
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

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => navigate("/seller/settlements")}>
          목록으로
        </Button>
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
