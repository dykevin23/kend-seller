import Card from "~/common/components/card";
import Content from "~/common/components/content";
import TextField from "~/common/components/text-field";
import Title from "~/common/components/title";
import type { Route } from "./+types/common-code-group-page";
import { Link, useNavigate } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";
import { Button } from "~/common/components/ui/button";
import { useRootData } from "~/hooks/useRootData";

export default function CommonCodeGroupPage({ params }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { commonCodes } = useRootData();

  const group = commonCodes?.find((item) => item.code === params.groupCode);

  const handleRowClick = (code: string) => {
    navigate(`./code/${code}`);
  };

  return (
    <Content>
      <Title title="공통코드 관리" />

      <div className="space-y-5">
        <Card>
          <h2 className="text-xl font-bold">공통코드 그룹</h2>
          <TextField label="그룹코드" value={group?.code} />
          <TextField label="그룹코드명" value={group?.name} />
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
            {group?.children.map((code, index) => (
              <TableRow key={code.id} onClick={() => handleRowClick(code.code)}>
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
            onClick={() => navigate("/system/commonCodes")}
          >
            돌아가기
          </Button>
          <Button type="button" asChild>
            <Link to="./submit">추가하기</Link>
          </Button>
        </div>
      </div>
    </Content>
  );
}
