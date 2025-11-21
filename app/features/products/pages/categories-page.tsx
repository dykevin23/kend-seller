import { Link } from "react-router";
import Title from "~/common/components/title";
import { Button } from "~/common/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";
import { products_main_category } from "~/seeds";

export default function CategoriesPage() {
  return (
    <div>
      <Title title="카테고리 관리" />

      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead>상품분류</TableHead>
            <TableHead>카테고리 코드</TableHead>
            <TableHead>카테고리명</TableHead>
            <TableHead>사용유무</TableHead>
            <TableHead>정렬순서</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products_main_category.map((data) => (
            <TableRow key={data.group_id}>
              <TableCell>{data.classification_code}</TableCell>
              <TableCell>{data.group_code}</TableCell>
              <TableCell>{data.group_name}</TableCell>
              <TableCell>{data.use_yn === "Y" ? "사용" : "사용안함"}</TableCell>
              <TableCell>{data.sort_order}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex pt-4 w-full justify-end">
        <Button asChild>
          <Link to="./submit">등록</Link>
        </Button>
      </div>
    </div>
  );
}
