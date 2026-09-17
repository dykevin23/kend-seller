import { useSearchParams } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/common/components/ui/select";
import type { Route } from "./+types/seller-approval-list-page";
import { makeSSRClient } from "~/supa-client";
import { getAllSellers } from "../queries";
import { SELLER_STATUS } from "../constrants";
import SellerApprovalTable from "../components/seller-approval-table";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "ALL";

  const sellers = await getAllSellers(client, { status });

  return { sellers, status };
};

export default function SellerApprovalListPage({
  loaderData,
}: Route.ComponentProps) {
  const { sellers, status } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();

  const handleStatusChange = (nextStatus: string) => {
    const next = new URLSearchParams(searchParams);
    if (nextStatus === "ALL") {
      next.delete("status");
    } else {
      next.set("status", nextStatus);
    }
    setSearchParams(next);
  };

  return (
    <Content className="space-y-4">
      <Title title="판매자 승인 관리" />

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">상태</span>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            {SELLER_STATUS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SellerApprovalTable sellers={sellers} />
    </Content>
  );
}
