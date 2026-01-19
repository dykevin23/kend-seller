import { useState } from "react";
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

// TODO: 실제 데이터는 loader에서 가져올 예정
interface ProductListItem {
  id: number;
  name: string;
  salesLast30Days: number | null;
  salePrice: number;
  status: string;
  stock: number;
}

// 임시 더미 데이터
const dummyProducts: ProductListItem[] = [
  {
    id: 1,
    name: "남성 캐주얼 티셔츠",
    salesLast30Days: null,
    salePrice: 29000,
    status: "SALE",
    stock: 150,
  },
  {
    id: 2,
    name: "여성 린넨 원피스",
    salesLast30Days: null,
    salePrice: 59000,
    status: "SALE",
    stock: 80,
  },
  {
    id: 3,
    name: "유니섹스 후드 집업",
    salesLast30Days: null,
    salePrice: 45000,
    status: "PREPARE",
    stock: 0,
  },
];

export default function ProductListPage() {
  // 검색 필터 상태
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchKeyword, setSearchKeyword] = useState("");

  // 선택된 행
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10; // TODO: 실제 데이터에서 계산

  // 임시 데이터
  const products = dummyProducts;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(products.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
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
    // TODO: 검색 로직 구현
    console.log("검색:", { statusFilter, searchKeyword });
  };

  const handleStatusChange = (newStatus: string) => {
    // TODO: 선택된 상품들 상태 변경
    console.log("상태 변경:", { selectedIds: Array.from(selectedIds), newStatus });
  };

  return (
    <Content>
      <Title title="상품 목록" />

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

          <Button onClick={handleSearch}>검색</Button>
        </div>
      </Card>

      {/* 관리 버튼 영역 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedIds.size > 0 && `${selectedIds.size}개 선택됨`}
        </div>
        <div className="flex items-center gap-2">
          <Select onValueChange={handleStatusChange}>
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
          <Button variant="destructive" disabled={selectedIds.size === 0}>
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
            <TableHead>상품번호</TableHead>
            <TableHead>상품명</TableHead>
            <TableHead>지난30일 판매량</TableHead>
            <TableHead>판매가</TableHead>
            <TableHead>상품상태</TableHead>
            <TableHead>재고수량</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length > 0 ? (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(product.id)}
                    onCheckedChange={(checked) =>
                      handleSelectRow(product.id, !!checked)
                    }
                    aria-label={`${product.name} 선택`}
                  />
                </TableCell>
                <TableCell>{product.id}</TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {product.name}
                </TableCell>
                <TableCell>
                  {product.salesLast30Days != null
                    ? formatNumber(product.salesLast30Days)
                    : "-"}
                </TableCell>
                <TableCell>{formatNumber(product.salePrice)}원</TableCell>
                <TableCell>{getStatusLabel(product.status)}</TableCell>
                <TableCell>{formatNumber(product.stock)}</TableCell>
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
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </Content>
  );
}
