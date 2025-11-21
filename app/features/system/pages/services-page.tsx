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
import { classifications } from "~/seeds";

export default function ServicesPage() {
  return (
    <div>
      <Title title="서비스 관리" />

      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead>번호</TableHead>
            <TableHead>서비스 분류코드</TableHead>
            <TableHead>서비스 명</TableHead>
            <TableHead>사용유무</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classifications.map((data) => (
            <TableRow key={data.code}>
              <TableCell>{data.rownum}</TableCell>
              <TableCell>{data.code}</TableCell>
              <TableCell>{data.name}</TableCell>
              <TableCell>{data.useYn === "Y" ? "사용" : "사용안함"}</TableCell>
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
