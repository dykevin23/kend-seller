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
import { SALES_STATUS } from "../constrants";
import { formatNumber } from "~/common/utils/format";
import type { Route } from "./+types/product-list-page";
import { makeSSRClient } from "~/supa-client";
import { getProducts, type ProductListItem } from "../queries";
import { getSellerInfo } from "~/features/seller/queries";
import { updateProductsStatus } from "../mutations";

const ITEMS_PER_PAGE = 10;

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "updateStatus") {
    const productIds = JSON.parse(formData.get("productIds") as string);
    const status = formData.get("status") as string;

    const seller = await getSellerInfo(client);
    if (!seller) {
      return { success: false, error: "판매자 정보를 찾을 수 없습니다." };
    }

    try {
      await updateProductsStatus(client, productIds, status, seller.id);
      return { success: true };
    } catch (error) {
      return { success: false, error: "상태 변경에 실패했습니다." };
    }
  }

  return { success: false, error: "알 수 없는 요청입니다." };
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const url = new URL(request.url);

  // URL 파라미터
  const page = Number(url.searchParams.get("page")) || 1;
  const status = url.searchParams.get("status") || "";
  const keyword = url.searchParams.get("keyword") || "";

  // 판매자 정보
  const seller = await getSellerInfo(client);
  if (!seller) {
    return { products: [], total: 0, page, status, keyword };
  }

  // 상품 목록 조회
  const { data: products, total } = await getProducts(client, {
    sellerId: seller.id,
    status,
    keyword,
    page,
    limit: ITEMS_PER_PAGE,
  });

  return { products, total, page, status, keyword };
};

export default function ProductListPage({ loaderData }: Route.ComponentProps) {
  const {
    products,
    total,
    page,
    status: initialStatus,
    keyword: initialKeyword,
  } = loaderData;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { confirm } = useAlert();
  const fetcher = useFetcher();
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // 검색 필터 상태 (초기값은 URL 파라미터에서)
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);

  // 선택된 행
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(products.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const isAllSelected =
    products.length > 0 && selectedIds.size === products.length;
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  const getStatusLabel = (status: string) => {
    return SALES_STATUS.find((s) => s.value === status)?.label ?? status;
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== "ALL") {
      params.set("status", statusFilter);
    }
    if (searchKeyword) {
      params.set("keyword", searchKeyword);
    }
    params.set("page", "1"); // 검색 시 첫 페이지로
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const handleStatusChange = (newStatus: string) => {
    if (selectedIds.size === 0) {
      return;
    }

    const statusLabel =
      SALES_STATUS.find((s) => s.value === newStatus)?.label ?? newStatus;

    confirm({
      title: "상태 변경",
      message: `선택한 ${selectedIds.size}개 상품의 상태를 "${statusLabel}"(으)로 변경하시겠습니까?`,
      primaryButton: {
        label: "변경",
        onClick: () => {
          fetcher.submit(
            {
              intent: "updateStatus",
              productIds: JSON.stringify(Array.from(selectedIds)),
              status: newStatus,
            },
            { method: "POST" }
          );
          setSelectedIds(new Set());
        },
      },
      secondaryButton: {
        label: "취소",
        onClick: () => {},
      },
    });
  };

  return (
    <Content>
      <Title title="상품 목록" />

      <div className="space-y-4">
        {/* 검색 필터 영역 */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium whitespace-nowrap">
                상품상태
              </span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  {SALES_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm font-medium whitespace-nowrap">
                상품명
              </span>
              <Input
                placeholder="상품명을 입력하세요"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
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
            {selectedIds.size > 0 && `${selectedIds.size}개 선택됨`}
          </div>
          <div className="flex items-center gap-2">
            <Select
              onValueChange={handleStatusChange}
              disabled={selectedIds.size === 0}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="상태 변경" />
              </SelectTrigger>
              <SelectContent>
                {SALES_STATUS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="destructive"
              size="sm"
              disabled={selectedIds.size === 0}
            >
              선택 삭제
            </Button>
          </div>
        </div>

        {/* 상품 목록 테이블 */}
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
              <TableHead className="text-center">상품코드</TableHead>
              <TableHead>상품명</TableHead>
              <TableHead className="text-center">지난30일 판매량</TableHead>
              <TableHead className="text-center">판매가</TableHead>
              <TableHead className="text-center">상품상태</TableHead>
              <TableHead className="text-center">재고수량</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/products/${product.product_code}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(product.id)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(product.id, !!checked)
                      }
                      aria-label={`${product.name} 선택`}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    {product.product_code}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {product.name}
                  </TableCell>
                  <TableCell className="text-center">-</TableCell>
                  <TableCell className="text-center">
                    {product.min_sale_price != null
                      ? product.min_sale_price === product.max_sale_price
                        ? `${formatNumber(product.min_sale_price)}원`
                        : `${formatNumber(product.min_sale_price)}원 ~ ${formatNumber(product.max_sale_price!)}원`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusLabel(product.status)}
                  </TableCell>
                  <TableCell className="text-center">
                    {product.total_stock != null
                      ? formatNumber(product.total_stock)
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  조회된 상품이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* 페이지네이션 */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </Content>
  );
}
