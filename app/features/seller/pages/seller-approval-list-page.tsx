import Content from "~/common/components/content";
import Title from "~/common/components/title";
import type { Route } from "./+types/seller-approval-list-page";
import { makeSSRClient } from "~/supa-client";
import { getAllSellers } from "../queries";
import SellerApprovalTable from "../components/seller-approval-table";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const sellers = await getAllSellers(client);

  return { sellers };
};

export default function SellerApprovalListPage({
  loaderData,
}: Route.ComponentProps) {
  return (
    <Content>
      <Title title="판매자 승인 관리" />
      <SellerApprovalTable sellers={loaderData.sellers} />
    </Content>
  );
}
