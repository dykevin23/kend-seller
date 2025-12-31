import { Link, useNavigate, useRouteLoaderData } from "react-router";
import Card from "~/common/components/card";
import Content from "~/common/components/content";
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
import type { loader } from "~/root";

export default function CommonCodeGroupPage() {
  const navigate = useNavigate();
  const { commonCodes } = useRouteLoaderData<typeof loader>("root");

  const handleRowClick = (id: string) => {
    navigate(`./group/${id}`);
  };

  return (
    <Content>
      <Title title="공통코드 관리" />

      <div className="space-y-5">
        <Card>
          <h2 className="text-xl font-bold">공통코드 그룹</h2>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead>No</TableHead>
                <TableHead>그룹코드</TableHead>
                <TableHead>그룹코드명</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commonCodes.map((commonCode, index) => (
                <TableRow
                  key={commonCode.id}
                  onClick={() => handleRowClick(commonCode.id)}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{commonCode.code}</TableCell>
                  <TableCell>{commonCode.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <div className="flex justify-end">
          <Button asChild>
            <Link to="./submit">등록</Link>
          </Button>
        </div>
      </div>
    </Content>
  );
}
