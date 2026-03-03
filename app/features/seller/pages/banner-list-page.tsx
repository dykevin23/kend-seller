import Content from "~/common/components/content";
import Title from "~/common/components/title";
import Card from "~/common/components/card";
import type { Route } from "./+types/banner-list-page";
import { makeSSRClient } from "~/supa-client";
import { getSellerInfo, getSellerBanners } from "../queries";
import BannerUploadArea from "../components/banner-upload-area";
import BannerListCard from "../components/banner-list-card";
import { MAX_BANNERS } from "../constrants";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const seller = await getSellerInfo(client);

  if (!seller) {
    return { banners: [], sellerCode: null };
  }

  const banners = await getSellerBanners(client, seller.id);

  return {
    banners,
    sellerCode: seller.seller_code,
  };
};

export default function BannerListPage({ loaderData }: Route.ComponentProps) {
  const { banners, sellerCode } = loaderData;

  if (!sellerCode) {
    return (
      <Content>
        <Title title="스토어 배너 관리" />
        <Card>
          <p className="text-muted-foreground">
            판매자 정보를 먼저 등록해주세요.
          </p>
        </Card>
      </Content>
    );
  }

  return (
    <Content className="space-y-4">
      <Title title="스토어 배너 관리" />
      <BannerUploadArea
        sellerCode={sellerCode}
        currentCount={banners.length}
        maxBanners={MAX_BANNERS}
      />
      <BannerListCard banners={banners} />
    </Content>
  );
}
