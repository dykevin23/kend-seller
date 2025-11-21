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
import { option_groups } from "~/seeds";

export default function OptionsPage() {
  return (
    <div>
      <Title title="옵션 관리" />

      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead>서비스</TableHead>
            <TableHead>옵션그룹key</TableHead>
            <TableHead>옵션그룹명</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {option_groups.map((data) => (
            <TableRow key={data.id}>
              <TableCell>{data.classification}</TableCell>
              <TableCell>
                <Link to={`./${data.id}`}>{data.group_key}</Link>
              </TableCell>
              <TableCell>{data.group_name}</TableCell>
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
