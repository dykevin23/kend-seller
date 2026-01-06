import Card from "~/common/components/card";
import type { Route } from "./+types/main-category-page";
import { Link, useNavigate, useOutletContext } from "react-router";
import { Button } from "~/common/components/ui/button";
import TextField from "~/common/components/text-field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";

export default function MainCategoryPage({ params }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { categories } = useOutletContext<{ categories: any }>();

  const category = categories.find(
    (item) => item.id === Number(params.categoryId)
  );

  const handleRowClick = (id: string) => {
    navigate(`./sub/${id}`);
  };

  return (
    <div className="space-y-5">
      <Card>
        <h2 className="text-xl font-bold">카테고리</h2>
        <TextField label="카테고리" value={category?.code} />
        <TextField label="카테고리명" value={category?.name} />
      </Card>

      <div className="flex justify-end">
        <Button type="submit">수정</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead>No</TableHead>
            <TableHead>그룹코드</TableHead>
            <TableHead>그룹코드명</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {category?.children.map((code, index) => (
            <TableRow key={code.id} onClick={() => handleRowClick(code.id)}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{code.code}</TableCell>
              <TableCell>{code.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/system/categories")}
        >
          돌아가기
        </Button>
        <Button type="button" asChild>
          <Link to="./submit">추가하기</Link>
        </Button>
      </div>
    </div>
  );
}
