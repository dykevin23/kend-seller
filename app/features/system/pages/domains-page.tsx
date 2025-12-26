import Content from "~/common/components/content";
import Title from "~/common/components/title";
import type { Route } from "./+types/domains-page";
import { makeSSRClient } from "~/supa-client";
import { getDomains } from "../queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";
import { Button } from "~/common/components/ui/button";
import { Link } from "react-router";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  const domains = await getDomains(client);

  return { domains };
};

export default function domainsPage({ loaderData }: Route.ComponentProps) {
  return (
    <Content>
      <Title title="도메인 관리" />

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
          {loaderData.domains.map((domain, index) => (
            <TableRow key={domain.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{domain.code}</TableCell>
              <TableCell>{domain.name}</TableCell>
              <TableCell>
                {domain.use_yn === "Y" ? "사용" : "사용안함"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex pt-4 w-full justify-end">
        <Button asChild>
          <Link to="./submit">등록</Link>
        </Button>
      </div>
    </Content>
  );
}
