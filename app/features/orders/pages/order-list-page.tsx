import { useState } from "react";
import { useNavigate, useSearchParams, useFetcher } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import Card from "~/common/components/card";
import { useAlert } from "~/hooks/useAlert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";
import { Checkbox } from "~/common/components/ui/checkbox";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/common/components/ui/select";
import Pagination from "~/common/components/pagination";
import { ORDER_STATUS, ORDER_STATUS_ACTIONS } from "../constrants";
import { formatNumber } from "~/common/utils/format";
import type { Route } from "./+types/order-list-page";
import { makeSSRClient } from "~/supa-client";
import { getSellerOrders, getNewOrderCount } from "../queries";
import { updateOrderStatus } from "../mutations";
import { getSellerInfo } from "~/features/seller/queries";

const ITEMS_PER_PAGE = 10;

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "updateStatus") {
    const orderIds = JSON.parse(formData.get("orderIds") as string);
    const status = formData.get("status") as string;

    const seller = await getSellerInfo(client);
    if (!seller) {
      return { success: false, error: "판매자 정보를 찾을 수 없습니다." };
    }

    try {
      const result = await updateOrderStatus(client, {
        orderIds,
        sellerId: seller.id,
        status,
      });
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: "상태 변경에 실패했습니다." };
    }
  }

  return { success: false, error: "알 수 없는 요청입니다." };
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const url = new URL(request.url);

  const page = Number(url.searchParams.get("page")) || 1;
  const status = url.searchParams.get("status") || "";
  const keyword = url.searchParams.get("keyword") || "";

  const seller = await getSellerInfo(client);
  if (!seller) {
    return { orders: [], total: 0, page, status, keyword, newOrderCount: 0 };
  }

  const [{ data: orders, total }, newOrderCount] = await Promise.all([
    getSellerOrders(client, {
      sellerId: seller.id,
      status,
      keyword,
      page,
      limit: ITEMS_PER_PAGE,
    }),
    getNewOrderCount(client, seller.id),
  ]);

  return { orders, total, page, status, keyword, newOrderCount };
};

export default function OrderListPage({ loaderData }: Route.ComponentProps) {
  const {
    orders,
    total,
    page,
    status: initialStatus,
    keyword: initialKeyword,
    newOrderCount,
  } = loaderData;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { confirm } = useAlert();
  const fetcher = useFetcher();
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>("");

  const selectedOrders = orders.filter((o) => selectedIds.has(o.id));
  const selectedStatuses = new Set(selectedOrders.map((o) => o.status));
  const hasMixedStatus = selectedStatuses.size > 1;

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(orders.map((o) => o.id)) : new Set());
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    checked ? newSelected.add(id) : newSelected.delete(id);
    setSelectedIds(newSelected);
  };

  const isAllSelected = orders.length > 0 && selectedIds.size === orders.length;
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  const getStatusLabel = (status: string) =>
    ORDER_STATUS.find((s) => s.value === status)?.label ?? status;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
    if (searchKeyword) params.set("keyword", searchKeyword);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const handleBulkStatusChange = (newStatus: string) => {
    if (selectedIds.size === 0) {
      setBulkStatus("");
      return;
    }

    const statusLabel =
      ORDER_STATUS_ACTIONS.find((s) => s.value === newStatus)?.label ?? newStatus;

    confirm({
      title: "주문 상태 변경",
      message: `선택한 ${selectedIds.size}건의 주문을 "${statusLabel}"(으)로 변경하시겠습니까? 현재 상태와 맞지 않는 건은 제외됩니다.`,
      primaryButton: {
        label: "변경",
        onClick: () => {
          fetcher.submit(
            {
              intent: "updateStatus",
              orderIds: JSON.stringify(Array.from(selectedIds)),
              status: newStatus,
            },
            { method: "POST" }
          );
          setSelectedIds(new Set());
          setBulkStatus("");
        },
      },
      secondaryButton: {
        label: "취소",
        onClick: () => setBulkStatus(""),
      },
    });
  };

  return (
    <Content>
      <Title title="주문 관리" />

      <div className="space-y-4">
        {newOrderCount > 0 && (
          <Card className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              신규 주문 {newOrderCount}건이 접수를 기다리고 있습니다.
            </p>
          </Card>
        )}

        {/* 검색 필터 영역 */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium whitespace-nowrap">주문상태</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  {ORDER_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm font-medium whitespace-nowrap">
                주문번호/수령인
              </span>
              <Input
                placeholder="주문번호 또는 수령인명을 입력하세요"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="max-w-[300px]"
              />
            </div>

            <Button onClick={handleSearch} size="sm">
              검색
            </Button>
          </div>
        </Card>

        {/* 관리 버튼 영역 */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedIds.size > 0 && `${selectedIds.size}건 선택됨`}
            {selectedIds.size > 0 && hasMixedStatus && (
              <span className="text-amber-600"> — 서로 다른 상태가 섞여 있어 일괄변경이 제한될 수 있습니다.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={bulkStatus}
              onValueChange={handleBulkStatusChange}
              disabled={selectedIds.size === 0}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="상태 변경" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUS_ACTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 주문 목록 테이블 */}
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllSelected || (isSomeSelected && "indeterminate")}
                  onCheckedChange={handleSelectAll}
                  aria-label="전체 선택"
                />
              </TableHead>
              <TableHead>주문번호</TableHead>
              <TableHead>수령인</TableHead>
              <TableHead>상품</TableHead>
              <TableHead className="text-center">주문금액</TableHead>
              <TableHead className="text-center">상태</TableHead>
              <TableHead className="text-center">주문일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/orders/${order.order_number}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(order.id)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(order.id, !!checked)
                      }
                      aria-label={`${order.order_number} 선택`}
                    />
                  </TableCell>
                  <TableCell>{order.order_number}</TableCell>
                  <TableCell>{order.recipient_name}</TableCell>
                  <TableCell className="max-w-[240px] truncate">
                    {order.item_summary}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatNumber(order.total_amount)}원
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusLabel(order.status)}
                  </TableCell>
                  <TableCell className="text-center">
                    {order.created_at.slice(0, 10)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  조회된 주문이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </Content>
  );
}
