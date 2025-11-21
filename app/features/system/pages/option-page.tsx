import Title from "~/common/components/title";
import type { Route } from "./+types/option-page";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";
import { option_values } from "~/seeds";

export const loader = ({ params }: Route.LoaderArgs) => {
  const { optionId } = params;
  const values = option_values.filter((values) => values.group_id === optionId);

  return { values };
};

export default function OptionPage({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <Title title="하위옵션 관리" />

      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead>서비스</TableHead>
            <TableHead>옵션그룹key</TableHead>
            <TableHead>옵션그룹명</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loaderData?.values.length > 0 ? (
            loaderData?.values?.map((data) => (
              <TableRow key={data.id}>
                <TableCell>{data.classification}</TableCell>
                <TableCell>{data.value}</TableCell>
                <TableCell>{data.name}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                No data.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
