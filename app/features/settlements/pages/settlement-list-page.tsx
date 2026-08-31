import { useNavigate, useSearchParams } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";
import { Button } from "~/common/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/common/components/ui/select";
import { cn } from "~/lib/utils";
import { formatNumber } from "~/common/utils/format";
import { SETTLEMENT_STATUS_LABELS } from "../constrants";
import type { Route } from "./+types/settlement-list-page";
import { makeSSRClient } from "~/supa-client";
import { getSettlementPeriods, getSettlements } from "../queries";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const url = new URL(request.url);
  const period = url.searchParams.get("period") ?? "ALL";
  const status = url.searchParams.get("status") ?? "ALL";

  const [settlements, periods] = await Promise.all([
    getSettlements(client, {
      periodStart: period === "ALL" ? undefined : period,
      status,
    }),
    getSettlementPeriods(client),
  ]);

  return { settlements, periods, period, status };
};

const STATUS_TABS = [
  { label: "전체", value: "ALL" },
  { label: "정산대기", value: "pending" },
  { label: "지급완료", value: "paid" },
] as const;

export default function SettlementListPage({
  loaderData,
}: Route.ComponentProps) {
  const { settlements, periods, period, status } = loaderData;
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
    <Content>
      <Title title="정산 내역" />

      <div className="mb-3 flex items-center justify-between">
        <div className="flex gap-2">
          {STATUS_TABS.map((tab) => (
            <Button
              key={tab.value}
              type="button"
              size="sm"
              variant={status === tab.value ? "default" : "outline"}
              onClick={() => handleStatusChange(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-36">
            <SelectValue />
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

      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead>정산월</TableHead>
            <TableHead>판매자</TableHead>
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
                onClick={() => navigate(`/system/settlements/${item.id}`)}
              >
                <TableCell className="py-3">
                  {item.period_start.slice(0, 7)}
                </TableCell>
                <TableCell className="py-3">
                  {item.seller_name} ({item.seller_code})
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
                  <span
                    className={cn(
                      "inline-block rounded-full px-2 py-1 text-xs font-medium",
                      item.status === "paid"
                        ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                    )}
                  >
                    {SETTLEMENT_STATUS_LABELS[item.status] ?? item.status}
                  </span>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                조회된 정산 내역이 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Content>
  );
}
