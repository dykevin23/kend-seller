import Card from "~/common/components/card";
import Content from "~/common/components/content";
import DaumPostCodeModal, {
  type IAddressType,
} from "~/common/components/daum-post-code-modal";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import Title from "~/common/components/title";
import { Separator } from "~/common/components/ui/separator";
import { Label } from "~/common/components/ui/label";
import type { Route } from "./+types/submit-seller-information-page";
import { makeSSRClient } from "~/supa-client";
import { getDomains } from "~/features/system/queries";
import { createHashtag } from "~/features/system/mutations";
import { Form } from "react-router";
import { Button } from "~/common/components/ui/button";
import { useCallback, useState } from "react";
import { z } from "zod";
import { getLoggedInUserId } from "~/features/users/queries";
import { createSellerInformation, setSellerHashtags } from "../mutations";
import { getSellerInfo, getSellerHashtags } from "../queries";
import { getSellerLogoUrl } from "../storage";
import { BUSINESS_TYPES } from "../constrants";
import SellerLogoUpload from "../components/seller-logo-upload";
import SellerHashtagInput from "../components/seller-hashtag-input";

const formSchema = z.object({
  bizrNo: z.string().length(10).nonempty(),
  representativeName: z.string().min(2),
  companyName: z.string().min(1),
  zoneCode: z.string().max(6),
  address: z.string(),
  addressDetail: z.string(),
  business: z.string(),
  domain: z.string(),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const { client } = makeSSRClient(request);

  // Step 2: 해시태그 저장
  if (intent === "saveHashtags") {
    const seller = await getSellerInfo(client);
    if (!seller) return { ok: false };

    const hashtagsJson = formData.get("hashtags") as string;
    const hashtagNames: string[] = JSON.parse(hashtagsJson);

    const hashtagIds: string[] = [];
    for (const name of hashtagNames) {
      const hashtag = await createHashtag(client, name);
      hashtagIds.push(hashtag.id);
    }

    await setSellerHashtags(client, seller.id, hashtagIds);
    return { ok: true };
  }

  // Step 1: 기본정보 등록
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!success) {
    return { formErrors: error.flatten().fieldErrors };
  }

  const userId = await getLoggedInUserId(client);
  await createSellerInformation(client, { ...data, userId: userId });

  return { ok: true };
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const domains = await getDomains(client);
  const seller = await getSellerInfo(client);

  let hashtags: { id: string; name: string }[] = [];
  let logoUrl = "";

  if (seller) {
    const hashtagsData = await getSellerHashtags(client, seller.id);
    hashtags = hashtagsData.map((h) => ({
      id: h.hashtags?.id ?? h.hashtag_id,
      name: h.hashtags?.name ?? "",
    }));
    logoUrl = getSellerLogoUrl(client, seller.seller_code);
  }

  return { domains, seller, hashtags, logoUrl };
};

export default function SubmitSellerInformationPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { seller, hashtags, logoUrl } = loaderData;

  const [hasChanges, setHasChanges] = useState(false);
  const handleHashtagChanged = useCallback((changed: boolean) => {
    setHasChanges(changed);
  }, []);

  // seller가 있으면 Step 2 (관리 모드)
  if (seller) {
    return (
      <Content>
        <Title title="판매자 정보 관리" />
        <Form method="post" className="space-y-5">
          {/* 대표 이미지 (로고) */}
          <Card>
            <h2 className="text-xl font-bold">대표 이미지</h2>
            <SellerLogoUpload
              sellerCode={seller.seller_code}
              logoUrl={logoUrl}
            />
          </Card>

          {/* 기본 정보 (읽기 전용) */}
          <Card>
            <h2 className="text-xl font-bold">기본정보</h2>
            <InfoRow label="판매자 코드" value={seller.seller_code} />
            <Separator />
            <InfoRow label="사업자 등록번호" value={seller.bizr_no} />
            <Separator />
            <InfoRow
              label="대표자 명"
              value={seller.representative_name}
            />
            <InfoRow label="상호명" value={seller.name} />
            <Separator />
            <InfoRow
              label="사업장 주소"
              value={`(${seller.zone_code}) ${seller.address} ${seller.address_detail}`}
            />
            <Separator />
            <InfoRow label="비즈니스 형태" value={seller.business} />
            <InfoRow
              label="대표 서비스"
              value={seller.domain_name ?? "-"}
            />
          </Card>

          {/* 해시태그 */}
          <Card>
            <h2 className="text-xl font-bold">해시태그</h2>
            <SellerHashtagInput
              initialHashtags={hashtags}
              onChanged={handleHashtagChanged}
            />
          </Card>

          <input type="hidden" name="intent" value="saveHashtags" />
          <div className="flex justify-end">
            <Button type="submit" disabled={!hasChanges}>
              저장
            </Button>
          </div>
        </Form>
      </Content>
    );
  }

  // seller가 없으면 Step 1 (등록 모드)
  return <SellerRegistrationForm loaderData={loaderData} />;
}

function SellerRegistrationForm({
  loaderData,
}: {
  loaderData: Route.ComponentProps["loaderData"];
}) {
  const [address, setAddress] = useState<IAddressType>();
  const handleZoneCode = (data: IAddressType) => {
    setAddress(data);
  };

  return (
    <Content>
      <Title title="판매자 정보 입력" />

      <Form className="space-y-5" method="post">
        <Card>
          <h2 className="text-xl font-bold">기본정보</h2>
          <TextField
            id="bizrNo"
            name="bizrNo"
            label="사업자 등록번호"
            direction="row"
            className="w-1/4"
          />
          <Separator />
          <TextField
            id="representativeName"
            name="representativeName"
            label="대표자 명"
            direction="row"
            className="w-1/3"
          />
          <TextField
            id="companyName"
            name="companyName"
            label="상호명"
            direction="row"
            className="w-1/3"
          />
          <div className="flex flex-col gap-2">
            <TextField
              label="사업장 주소"
              direction="row"
              placeholder="우편번호"
              className="w-1/4"
              id="zoneCode"
              name="zoneCode"
              readOnly
              value={address?.zoneCode}
              outsideAdornment={
                <DaumPostCodeModal onComplete={handleZoneCode} />
              }
            />

            <TextField
              id="address"
              name="address"
              label=""
              direction="row"
              placeholder="기본주소"
              readOnly
              className="w-2/3"
              value={address?.address}
            />
            <TextField
              id="addressDetail"
              name="addressDetail"
              label=""
              direction="row"
              placeholder="상세주소"
              className="w-2/3"
            />
          </div>
          <Select
            id="business"
            name="business"
            label="비즈니스 형태"
            options={BUSINESS_TYPES.map((type) => ({
              label: type.label,
              value: type.value,
            }))}
            direction="row"
            className="w-1/4"
          />
          <Select
            id="domain"
            name="domain"
            label="대표 서비스"
            options={loaderData.domains.map((domain) => ({
              label: domain.name,
              value: domain.id + "",
            }))}
            direction="row"
            className="w-1/4"
          />
        </Card>
        <div className="flex justify-end">
          <Button type="submit">등록</Button>
        </div>
      </Form>
    </Content>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center">
      <Label className="w-40 shrink-0 text-muted-foreground">{label}</Label>
      <span className="text-sm">{value}</span>
    </div>
  );
}
