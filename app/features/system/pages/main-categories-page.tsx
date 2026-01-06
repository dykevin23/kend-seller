import Card from "~/common/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";
import { Link, useNavigate, useOutletContext } from "react-router";
import { Button } from "~/common/components/ui/button";

export default function MainCategoriesPage() {
  const navigate = useNavigate();
  const { categories, domains } = useOutletContext<{
    categories: any;
    domains: any;
  }>();

  const handleRowClick = (id: number) => {
    navigate(`./${id}`);
  };

  return (
    <div className="space-y-5">
      <Card>
        <h2 className="text-xl font-bold">메인 카테고리</h2>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>서비스</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>카테고리 명</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length > 0 ? (
              categories.map((category) => (
                <TableRow
                  key={category.id}
                  onClick={() => handleRowClick(category.id)}
                >
                  <TableCell>
                    {
                      domains.find((domain) => domain.id === category.domain_id)
                        .name
                    }
                  </TableCell>
                  <TableCell>{category.code}</TableCell>
                  <TableCell>{category.name}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="flex justify-center items-center"
                >
                  no data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      <div className="flex justify-end">
        <Button asChild>
          <Link to="./submit">등록</Link>
        </Button>
      </div>
    </div>
  );
}
