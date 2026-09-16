import { useEffect, useState } from "react";
import { useSearchParams, useFetcher } from "react-router";
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
import { Input } from "~/common/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/common/components/ui/select";
import Pagination from "~/common/components/pagination";
import { SKU_STATUS_OPTIONS, LOW_STOCK_THRESHOLD } from "../constrants";
import { formatNumber } from "~/common/utils/format";
import type { Route } from "./+types/stocks-keeping-page";
import { makeSSRClient } from "~/supa-client";
import { getSellerStockKeepings, type StockKeepingItem } from "../queries";
import { getSellerInfo } from "~/features/seller/queries";
import { getSystemOptionsByDomain } from "~/features/system/queries";
import { updateStockKeeping } from "../mutations";

const ITEMS_PER_PAGE = 20;
const SKU_STATUS_VALUES = new Set<string>(
  SKU_STATUS_OPTIONS.map((s) => s.value)
);

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "updateStock") {
    const skuId = formData.get("skuId") as string;
    const stock = Number(formData.get("stock"));
    const status = formData.get("status") as string;

    if (!skuId || !Number.isInteger(stock) || stock < 0) {
      return { success: false, error: "재고 수량을 올바르게 입력해주세요." };
    }
    if (!SKU_STATUS_VALUES.has(status)) {
      return { success: false, error: "알 수 없는 상태값입니다." };
    }

    try {
      await updateStockKeeping(client, skuId, { stock, status });
      return { success: true, skuId };
    } catch (error) {
      return { success: false, error: "재고 수정에 실패했습니다." };
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
    return { items: [], total: 0, page, status, keyword, systemOptions: [] };
  }

  const { data: items, total } = await getSellerStockKeepings(client, {
    sellerId: seller.id,
    status,
    keyword,
    page,
    limit: ITEMS_PER_PAGE,
  });

  const systemOptions = seller.domain_id
    ? await getSystemOptionsByDomain(client, seller.domain_id)
    : [];

  return { items, total, page, status, keyword, systemOptions };
};

export default function StocksKeepingPage({ loaderData }: Route.ComponentProps) {
  const {
    items,
    total,
    page,
    status: initialStatus,
    keyword: initialKeyword,
    systemOptions,
  } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== "ALL") {
      params.set("status", statusFilter);
    }
    if (searchKeyword) {
      params.set("keyword", searchKeyword);
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  };

  const getOptionLabel = (code: string) =>
    systemOptions.find((opt) => opt.code === code)?.name ?? code;

  return (
    <Content>
      <Title title="재고 관리" />

      <div className="space-y-4">
        {/* 검색 필터 영역 */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium whitespace-nowrap">
                판매상태
              </span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  {SKU_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm font-medium whitespace-nowrap">
                상품명 / SKU
              </span>
              <Input
                placeholder="상품명 또는 SKU코드를 입력하세요"
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

        {/* SKU 목록 테이블 */}
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>상품명</TableHead>
              <TableHead className="text-center">SKU</TableHead>
              <TableHead>옵션</TableHead>
              <TableHead className="text-right">판매가</TableHead>
              <TableHead className="text-center w-[110px]">재고</TableHead>
              <TableHead className="text-center w-[140px]">
                판매상태
              </TableHead>
              <TableHead className="text-center w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((sku) => (
                <StockKeepingRow
                  key={sku.id}
                  sku={sku}
                  getOptionLabel={getOptionLabel}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  조회된 SKU가 없습니다.
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

function StockKeepingRow({
  sku,
  getOptionLabel,
}: {
  sku: StockKeepingItem;
  getOptionLabel: (code: string) => string;
}) {
  const fetcher = useFetcher({ key: `sku-${sku.id}` });
  const [stock, setStock] = useState(sku.stock);
  const [status, setStatus] = useState(sku.status);

  // 저장 완료 후 서버 revalidate로 내려온 최신값으로 로컬 입력값 동기화
  useEffect(() => {
    if (fetcher.state === "idle") {
      setStock(sku.stock);
      setStatus(sku.status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sku.stock, sku.status]);

  const isDirty = stock !== sku.stock || status !== sku.status;
  const isSaving = fetcher.state !== "idle";

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStock = Math.max(0, Number(e.target.value) || 0);
    setStock(newStock);
    // 재고가 0이 되는 순간 판매중 상태를 유지할 수 없으므로 품절로 전환
    if (newStock === 0 && status === "SALE") {
      setStatus("SOLD_OUT");
    }
  };

  const handleSave = () => {
    fetcher.submit(
      {
        intent: "updateStock",
        skuId: sku.id,
        stock: String(stock),
        status,
      },
      { method: "POST" }
    );
  };

  return (
    <TableRow>
      <TableCell className="max-w-[240px] truncate">
        {sku.product_name}
      </TableCell>
      <TableCell className="text-center">{sku.sku_code}</TableCell>
      <TableCell>
        {Object.entries(sku.options || {})
          .map(([key, value]) => `${getOptionLabel(key)}: ${value}`)
          .join(" / ") || "-"}
      </TableCell>
      <TableCell className="text-right">
        {formatNumber(sku.sale_price)}원
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            value={stock}
            onChange={handleStockChange}
            className="w-20 text-right"
          />
          {stock === 0 && (
            <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400 whitespace-nowrap">
              품절
            </span>
          )}
          {stock > 0 && stock <= LOW_STOCK_THRESHOLD && (
            <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 whitespace-nowrap">
              부족
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SKU_STATUS_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.value === "SALE" && stock === 0}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-center">
        <Button
          size="sm"
          disabled={!isDirty || isSaving}
          onClick={handleSave}
        >
          {isSaving ? "저장 중" : "저장"}
        </Button>
      </TableCell>
    </TableRow>
  );
}
