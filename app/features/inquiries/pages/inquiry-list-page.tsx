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
import {
  INQUIRY_CATEGORY_LABELS,
  INQUIRY_STATUS_LABELS,
} from "../constrants";
import type { Route } from "./+types/inquiry-list-page";
import { makeSSRClient } from "~/supa-client";
import { getSellerInquiries } from "../queries";
import { getSellerInfo } from "~/features/seller/queries";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "ALL";
  const category = url.searchParams.get("category") ?? "ALL";

  const seller = await getSellerInfo(client);
  if (!seller) {
    return { inquiries: [], status, category };
  }

  const inquiries = await getSellerInquiries(client, seller.id, {
    status,
    category,
  });
  return { inquiries, status, category };
};

const STATUS_TABS = [
  { label: "전체", value: "ALL" },
  { label: "답변대기", value: "pending" },
  { label: "답변완료", value: "answered" },
] as const;

export default function InquiryListPage({ loaderData }: Route.ComponentProps) {
  const { inquiries, status, category } = loaderData;
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

  const handleCategoryChange = (nextCategory: string) => {
    const next = new URLSearchParams(searchParams);
    if (nextCategory === "ALL") {
      next.delete("category");
    } else {
      next.set("category", nextCategory);
    }
    setSearchParams(next);
  };

  return (
    <Content>
      <Title title="문의 관리" />

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
      </div>

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
                  <span
                    className={cn(
                      "inline-block rounded-full px-2 py-1 text-xs font-medium",
                      item.status === "answered"
                        ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                    )}
                  >
                    {INQUIRY_STATUS_LABELS[item.status] ?? item.status}
                  </span>
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
    </Content>
  );
}
