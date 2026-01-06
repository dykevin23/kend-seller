import { Outlet } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import type { Route } from "./+types/category-layout";
import { makeSSRClient } from "~/supa-client";
import { getCategories, getDomains } from "../queries";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  const categories = await getCategories(client);
  const domains = await getDomains(client);

  return { domains, categories };
};

export default function CategoryLayout({ loaderData }: Route.ComponentProps) {
  return (
    <Content>
      <Title title="카테고리 관리" />

      <Outlet
        context={{
          categories: loaderData?.categories,
          domains: loaderData?.domains,
        }}
      />
    </Content>
  );
}
