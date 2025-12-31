import { Link, useRouteLoaderData } from "react-router";
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
import type { loader as rootLoader } from "~/root";
import { useState } from "react";

export default function CommonCodesPages() {
  const { commonCodes } = useRouteLoaderData<typeof rootLoader>("root");
  const [codes, setCodes] = useState([]);
  const [rowSelectionGroupId, setRowSelectionGroupId] = useState<string>("");

  const handleRowSelection = (id: string) => {
    const [group] = commonCodes.filter((groups) => groups.id === id);
    if (group) {
      setRowSelectionGroupId(id);
      setCodes(
        group.children.map((item) => {
          return { ...item, group_code: group.code };
        })
      );
    }
  };

  return (
    <Content>
      <Title title="공통코드 관리" />

      <div className="grid grid-cols-2 gap-5 mx-auto">
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
                    onClick={() => handleRowSelection(commonCode.id)}
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
        <div className="space-y-5">
          <Card>
            <h2 className="text-xl font-bold">공통코드</h2>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>No</TableHead>
                  <TableHead>그룹코드</TableHead>
                  <TableHead>코드</TableHead>
                  <TableHead>코드명</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code, index) => (
                  <TableRow key={code.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{code.group_code}</TableCell>
                    <TableCell>{code.code}</TableCell>
                    <TableCell>{code.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
          <div className="flex justify-end">
            <Button asChild>
              <Link to={`./submit?group_id=${rowSelectionGroupId}`}>등록</Link>
            </Button>
          </div>
        </div>
      </div>
    </Content>
  );
}
