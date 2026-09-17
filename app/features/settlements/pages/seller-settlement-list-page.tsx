import { useNavigate, useSearchParams } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import Card from "~/common/components/card";
import { KpiTile } from "~/common/components/stat-widgets";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";
import { Badge } from "~/common/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/common/components/ui/select";
import { formatNumber } from "~/common/utils/format";
import { SETTLEMENT_STATUS, SETTLEMENT_STATUS_LABELS } from "../constrants";
import type { Route } from "./+types/seller-settlement-list-page";
import { makeSSRClient } from "~/supa-client";
import { getSellerSettlements, getSellerSettlementPeriods } from "../queries";
import { getSellerInfo } from "~/features/seller/queries";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const url = new URL(request.url);
  const period = url.searchParams.get("period") ?? "ALL";
  const status = url.searchParams.get("status") ?? "ALL";

  const seller = await getSellerInfo(client);
  if (!seller) {
    return {
      settlements: [],
      periods: [],
      period,
      status,
      pendingAmount: 0,
      paidTotalAmount: 0,
      lastPaidAmount: null as number | null,
      lastPaidAt: null as string | null,
    };
  }

  const [allSettlements, periods] = await Promise.all([
    getSellerSettlements(client, seller.id),
    getSellerSettlementPeriods(client, seller.id),
  ]);

  const pendingAmount = allSettlements
    .filter((row) => row.status === "pending")
    .reduce((sum, row) => sum + row.settlement_amount, 0);
  const paidRows = allSettlements.filter((row) => row.status === "paid");
  const paidTotalAmount = paidRows.reduce((sum, row) => sum + row.settlement_amount, 0);
  const lastPaid = paidRows[0] ?? null;

  const settlements = allSettlements.filter((row) => {
    if (period !== "ALL" && row.period_start !== period) return false;
    if (status !== "ALL" && row.status !== status) return false;
    return true;
  });

  return {
    settlements,
    periods,
    period,
    status,
    pendingAmount,
    paidTotalAmount,
    lastPaidAmount: lastPaid?.settlement_amount ?? null,
    lastPaidAt: lastPaid?.paid_at ?? null,
  };
};

export default function SellerSettlementListPage({
  loaderData,
}: Route.ComponentProps) {
  const {
    settlements,
    periods,
    period,
    status,
    pendingAmount,
    paidTotalAmount,
    lastPaidAmount,
    lastPaidAt,
  } = loaderData;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleStatusChange = (nextStatus: string) => {
    const next = new URLSearchParams(searchParams);
    if (nextStatus === "ALL") {
      next.delete("status");
    } else {
      next.set("status", nextStatus);
    }
    setSearchParams(next);
  };

  const handlePeriodChange = (nextPeriod: string) => {
    const next = new URLSearchParams(searchParams);
    if (nextPeriod === "ALL") {
      next.delete("period");
    } else {
      next.set("period", nextPeriod);
    }
    setSearchParams(next);
  };

  return (
    <Content className="space-y-4">
      <Title title="정산 내역" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiTile
          label="정산 예정 금액"
          value={`${formatNumber(pendingAmount)}원`}
          note="아직 지급되지 않은 금액"
          tone={pendingAmount > 0 ? "warn" : "default"}
        />
        <KpiTile
          label="최근 지급"
          value={lastPaidAmount != null ? `${formatNumber(lastPaidAmount)}원` : "-"}
          note={lastPaidAt ? lastPaidAt.slice(0, 10) : "지급 이력 없음"}
        />
        <KpiTile
          label="누적 지급 총액"
          value={`${formatNumber(paidTotalAmount)}원`}
          note="지금까지 지급완료된 금액 합계"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">정산월</span>
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="전체 기간" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 기간</SelectItem>
              {periods.map((p) => (
                <SelectItem key={p} value={p}>
                  {p.slice(0, 7)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">상태</span>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체</SelectItem>
              {SETTLEMENT_STATUS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>정산월</TableHead>
              <TableHead className="text-right">매출액</TableHead>
              <TableHead className="text-right">배송비 보전</TableHead>
              <TableHead className="text-right">수수료</TableHead>
              <TableHead className="text-right">정산액</TableHead>
              <TableHead className="text-center">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settlements.length > 0 ? (
              settlements.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/seller/settlements/${item.id}`)}
                >
                  <TableCell className="py-3">
                    {item.period_start.slice(0, 7)}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    {formatNumber(item.total_sales_amount)}원
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    {formatNumber(item.shipping_reimbursement)}원
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    {formatNumber(item.commission_amount)}원
                  </TableCell>
                  <TableCell className="py-3 text-right font-medium">
                    {formatNumber(item.settlement_amount)}원
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <Badge
                      variant={item.status === "paid" ? "success" : "warning"}
                      className="mx-auto"
                    >
                      {SETTLEMENT_STATUS_LABELS[item.status] ?? item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  조회된 정산 내역이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </Content>
  );
}
