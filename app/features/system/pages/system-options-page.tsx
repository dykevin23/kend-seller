import { Link, useNavigate } from "react-router";
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
import { makeSSRClient } from "~/supa-client";
import { getDomains, getSystemOptions } from "../queries";
import type { Route } from "./+types/system-options-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const systemOptions = await getSystemOptions(client);
  const domains = await getDomains(client);

  return { systemOptions, domains };
};

export default function SystemOptionsPage({
  loaderData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const { systemOptions, domains } = loaderData;

  const handleRowClick = (code: string) => {
    navigate(`./${code}`);
  };

  return (
    <Content>
      <Title title="시스템 옵션 관리" />

      <div className="space-y-5">
        <Card>
          <h2 className="text-xl font-bold">시스템 옵션</h2>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead>No</TableHead>
                <TableHead>도메인</TableHead>
                <TableHead>옵션 코드</TableHead>
                <TableHead>옵션명</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systemOptions.length > 0 ? (
                systemOptions.map((option, index) => (
                  <TableRow
                    key={option.id}
                    onClick={() => handleRowClick(option.code)}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {option.domain_id
                        ? domains.find((d) => d.id === option.domain_id)?.name
                        : "전체"}
                    </TableCell>
                    <TableCell>{option.code}</TableCell>
                    <TableCell>{option.name}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
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
    </Content>
  );
}
