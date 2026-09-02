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
import {
  createSellerInformation,
  updateSellerInformation,
  setSellerHashtags,
} from "../mutations";
import { getSellerInfo, getSellerHashtags } from "../queries";
import { getSellerLogoUrl } from "../storage";
import { BUSINESS_TYPES, BANK_LIST } from "../constrants";
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
  bankName: z.string().nonempty("정산 계좌 은행을 선택해주세요"),
  accountNumber: z
    .string()
    .regex(/^\d{8,20}$/, "계좌번호는 '-' 없이 숫자 8~20자리로 입력해주세요"),
  accountHolderName: z.string().nonempty("예금주명을 입력해주세요"),
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

  // 반려 후 재제출: 정보 갱신 + 상태 PENDING으로 리셋
  if (intent === "resubmit") {
    const { success, data, error } = formSchema.safeParse(
      Object.fromEntries(formData)
    );

    if (!success) {
      return { formErrors: error.flatten().fieldErrors };
    }

    const seller = await getSellerInfo(client);
    if (!seller) return { ok: false };

    await updateSellerInformation(client, seller.id, data);

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

  // seller가 없으면 Step 1 (등록 모드)
  if (!seller) {
    return <SellerRegistrationForm loaderData={loaderData} intent="register" />;
  }

  // 승인 대기중이면 대기 안내 화면
  if (seller.status === "PENDING") {
    return <SellerPendingNotice seller={seller} />;
  }

  // 반려되었으면 사유 노출 + 재제출 폼
  if (seller.status === "REJECTED") {
    return (
      <SellerRegistrationForm
        loaderData={loaderData}
        seller={seller}
        intent="resubmit"
      />
    );
  }

  // 승인 완료(APPROVED)면 Step 2 (관리 모드)
  return (
    <Content>
      <Title title="판매자 정보 관리" />
      <Form method="post" className="space-y-5">
        {/* 대표 이미지 (로고) */}
        <Card>
          <h2 className="text-xl font-bold">대표 이미지</h2>
          <SellerLogoUpload sellerCode={seller.seller_code} logoUrl={logoUrl} />
        </Card>

        {/* 기본 정보 (읽기 전용) */}
        <Card>
          <h2 className="text-xl font-bold">기본정보</h2>
          <InfoRow label="판매자 코드" value={seller.seller_code} />
          <Separator />
          <InfoRow label="사업자 등록번호" value={seller.bizr_no} />
          <Separator />
          <InfoRow label="대표자 명" value={seller.representative_name} />
          <InfoRow label="상호명" value={seller.name} />
          <Separator />
          <InfoRow
            label="사업장 주소"
            value={`(${seller.zone_code}) ${seller.address} ${seller.address_detail}`}
          />
          <Separator />
          <InfoRow label="비즈니스 형태" value={seller.business} />
          <InfoRow label="대표 서비스" value={seller.domain_name ?? "-"} />
        </Card>

        {/* 정산 계좌 (읽기 전용 — 최초 등록/재제출 시에만 입력 가능) */}
        <Card>
          <h2 className="text-xl font-bold">정산 계좌</h2>
          <InfoRow label="은행" value={seller.bank_name ?? "-"} />
          <Separator />
          <InfoRow label="계좌번호" value={seller.account_number ?? "-"} />
          <Separator />
          <InfoRow label="예금주명" value={seller.account_holder_name ?? "-"} />
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

function SellerPendingNotice({
  seller,
}: {
  seller: NonNullable<Route.ComponentProps["loaderData"]["seller"]>;
}) {
  return (
    <Content className="space-y-4">
      <Title title="판매자 정보 관리" />
      <Card className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <h2 className="text-lg font-bold mb-2 text-amber-700 dark:text-amber-400">
          승인 대기 중입니다
        </h2>
        <p className="text-sm text-muted-foreground">
          제출하신 업체 정보를 관리자가 확인하고 있습니다. 승인 완료 후
          정상적으로 이용하실 수 있습니다.
        </p>
      </Card>
      <Card>
        <h2 className="text-xl font-bold">제출한 정보</h2>
        <InfoRow label="사업자 등록번호" value={seller.bizr_no} />
        <Separator />
        <InfoRow label="대표자 명" value={seller.representative_name} />
        <InfoRow label="상호명" value={seller.name} />
        <Separator />
        <InfoRow
          label="사업장 주소"
          value={`(${seller.zone_code}) ${seller.address} ${seller.address_detail}`}
        />
        <Separator />
        <InfoRow label="비즈니스 형태" value={seller.business} />
        <Separator />
        <InfoRow label="정산 계좌" value={seller.bank_name ?? "-"} />
        <InfoRow label="계좌번호" value={seller.account_number ?? "-"} />
        <InfoRow label="예금주명" value={seller.account_holder_name ?? "-"} />
      </Card>
    </Content>
  );
}

function SellerRegistrationForm({
  loaderData,
  seller,
  intent,
}: {
  loaderData: Route.ComponentProps["loaderData"];
  seller?: NonNullable<Route.ComponentProps["loaderData"]["seller"]>;
  intent: "register" | "resubmit";
}) {
  const [address, setAddress] = useState<IAddressType | undefined>(
    seller
      ? { zoneCode: seller.zone_code, address: seller.address, addressType: "" }
      : undefined
  );
  const handleZoneCode = (data: IAddressType) => {
    setAddress(data);
  };

  return (
    <Content className="space-y-4">
      <Title title={intent === "resubmit" ? "판매자 정보 관리" : "판매자 정보 입력"} />

      {intent === "resubmit" && seller?.rejection_reason && (
        <Card className="border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <h2 className="text-lg font-bold mb-2 text-red-700 dark:text-red-400">
            승인 결과: 반려
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            제출하신 업체 정보가 반려되었습니다. 아래 사유를 확인하고 정보를
            수정한 뒤 다시 제출해주세요.
          </p>
          <p className="text-sm font-medium">{seller.rejection_reason}</p>
        </Card>
      )}

      <Form className="space-y-5" method="post">
        <input type="hidden" name="intent" value={intent} />
        <Card>
          <h2 className="text-xl font-bold">기본정보</h2>
          <TextField
            id="bizrNo"
            name="bizrNo"
            label="사업자 등록번호"
            direction="row"
            className="w-1/4"
            defaultValue={seller?.bizr_no}
          />
          <Separator />
          <TextField
            id="representativeName"
            name="representativeName"
            label="대표자 명"
            direction="row"
            className="w-1/3"
            defaultValue={seller?.representative_name}
          />
          <TextField
            id="companyName"
            name="companyName"
            label="상호명"
            direction="row"
            className="w-1/3"
            defaultValue={seller?.name}
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
              defaultValue={seller?.address_detail}
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
            defaultValue={seller?.business}
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
            defaultValue={seller?.domain_id ?? undefined}
          />
        </Card>
        <Card>
          <h2 className="text-xl font-bold">정산 계좌</h2>
          <p className="px-4 text-xs text-muted-foreground">
            매출 정산금을 지급받을 계좌입니다. 아직 계좌 실명 확인(1원 인증)은
            지원하지 않아 입력하신 정보 그대로 저장되니, 정확히 입력해주세요.
          </p>
          <Select
            id="bankName"
            name="bankName"
            label="은행"
            options={BANK_LIST.map((bank) => ({
              label: bank.label,
              value: bank.value,
            }))}
            direction="row"
            className="w-1/4"
            defaultValue={seller?.bank_name ?? undefined}
          />
          <TextField
            id="accountNumber"
            name="accountNumber"
            label="계좌번호"
            direction="row"
            className="w-1/3"
            placeholder="'-' 없이 숫자만 입력"
            defaultValue={seller?.account_number ?? undefined}
          />
          <TextField
            id="accountHolderName"
            name="accountHolderName"
            label="예금주명"
            direction="row"
            className="w-1/4"
            defaultValue={seller?.account_holder_name ?? undefined}
          />
        </Card>
        <div className="flex justify-end">
          <Button type="submit">
            {intent === "resubmit" ? "재제출" : "등록"}
          </Button>
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
