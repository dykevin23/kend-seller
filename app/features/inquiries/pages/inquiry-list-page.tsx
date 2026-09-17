import { useNavigate, useSearchParams } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import Card from "~/common/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";
import { Button } from "~/common/components/ui/button";
import { Badge } from "~/common/components/ui/badge";
import { Input } from "~/common/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/common/components/ui/select";
import {
  INQUIRY_CATEGORY_LABELS,
  INQUIRY_STATUS_LABELS,
} from "../constrants";
import { formatNumber } from "~/common/utils/format";
import type { Route } from "./+types/inquiry-list-page";
import { makeSSRClient } from "~/supa-client";
import { getSellerInquiries, getSellerInquiryStats } from "../queries";
import { getSellerInfo } from "~/features/seller/queries";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "ALL";
  const category = url.searchParams.get("category") ?? "ALL";
  const periodStart = url.searchParams.get("periodStart") ?? "";
  const periodEnd = url.searchParams.get("periodEnd") ?? "";
  const sort =
    url.searchParams.get("sort") === "pending_first" ? "pending_first" : "latest";

  const seller = await getSellerInfo(client);
  if (!seller) {
    return {
      inquiries: [],
      status,
      category,
      periodStart,
      periodEnd,
      sort,
      stats: { totalCount: 0, unansweredCount: 0 },
    };
  }

  const [inquiries, stats] = await Promise.all([
    getSellerInquiries(client, seller.id, {
      status,
      category,
      periodStart: periodStart || undefined,
      periodEnd: periodEnd || undefined,
      sort,
    }),
    getSellerInquiryStats(client, seller.id),
  ]);
  return { inquiries, status, category, periodStart, periodEnd, sort, stats };
};

const STATUS_TABS = [
  { label: "전체", value: "ALL" },
  { label: "답변대기", value: "pending" },
  { label: "답변완료", value: "answered" },
] as const;

export default function InquiryListPage({ loaderData }: Route.ComponentProps) {
  const { inquiries, status, category, periodStart, periodEnd, sort, stats } =
    loaderData;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === "ALL") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const handleStatusChange = (nextStatus: string) => updateParam("status", nextStatus);
  const handleCategoryChange = (nextCategory: string) =>
    updateParam("category", nextCategory);

  const answeredCount = stats.totalCount - stats.unansweredCount;
  const responseRate =
    stats.totalCount > 0 ? Math.round((answeredCount / stats.totalCount) * 100) : 0;

  return (
    <Content>
      <Title title="문의 관리" />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Card>
          <p className="text-sm text-muted-foreground">전체 문의</p>
          <p className="mt-1 text-2xl font-bold">{formatNumber(stats.totalCount)}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">미답변</p>
          <p className="mt-1 text-2xl font-bold text-warning">
            {formatNumber(stats.unansweredCount)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">응답률</p>
          <p className="mt-1 text-2xl font-bold">
            {responseRate}
            <span className="text-sm font-medium text-muted-foreground">%</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatNumber(answeredCount)}건 답변완료
          </p>
        </Card>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
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
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            className="w-36"
            value={periodStart}
            onChange={(e) => updateParam("periodStart", e.target.value)}
          />
          <span className="text-sm text-muted-foreground">~</span>
          <Input
            type="date"
            className="w-36"
            value={periodEnd}
            onChange={(e) => updateParam("periodEnd", e.target.value)}
          />
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 카테고리</SelectItem>
              {Object.entries(INQUIRY_CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => updateParam("sort", v)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="pending_first">답변대기 우선</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>접수일</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>제목</TableHead>
              <TableHead>주문번호</TableHead>
              <TableHead>상품</TableHead>
              <TableHead className="text-center">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.length > 0 ? (
              inquiries.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/orders/inquiries/${item.id}`)}
                >
                  <TableCell className="py-3">
                    {item.created_at.slice(0, 10)}
                  </TableCell>
                  <TableCell className="py-3">
                    {INQUIRY_CATEGORY_LABELS[item.category] ?? item.category}
                  </TableCell>
                  <TableCell className="max-w-[280px] truncate py-3">
                    {item.title}
                  </TableCell>
                  <TableCell className="py-3">{item.order_number}</TableCell>
                  <TableCell className="max-w-[200px] truncate py-3">
                    {item.product_name}
                  </TableCell>
                  <TableCell className="py-3 text-center">
                    <Badge
                      variant={item.status === "answered" ? "success" : "warning"}
                      className="mx-auto"
                    >
                      {INQUIRY_STATUS_LABELS[item.status] ?? item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  조회된 문의가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </Content>
  );
}
