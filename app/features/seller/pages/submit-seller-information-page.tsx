import Card from "~/common/components/card";
import Content from "~/common/components/content";
import DaumPostCodeModal, {
  type IAddressType,
} from "~/common/components/daum-post-code-modal";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import Title from "~/common/components/title";
import { Separator } from "~/common/components/ui/separator";
import type { Route } from "./+types/submit-seller-information-page";
import { makeSSRClient } from "~/supa-client";
import { getDomains } from "~/features/system/queries";
import { Form, useNavigate, useRouteLoaderData } from "react-router";
import { Button } from "~/common/components/ui/button";
import { useEffect, useState } from "react";
import { z } from "zod";
import type { loader as rootLoader } from "~/root";
import { useCommonCodes } from "~/hooks/useCommonCodes";
import { getLoggedInUserId } from "~/features/users/queries";
import { createSellerInformation } from "../mutations";

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
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!success) {
    return { formErrors: error.flatten().fieldErrors };
  }

  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  await createSellerInformation(client, { ...data, userId: userId });

  return { ok: true };
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const domains = await getDomains(client);

  return { domains };
};

export default function SubmitSellerInformationPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const { commonCodes } = useRouteLoaderData<typeof rootLoader>("root");
  const business = useCommonCodes("BUSINESS_TYPE", commonCodes);

  const [address, setAddress] = useState<IAddressType>();
  const handleZoneCode = (data: IAddressType) => {
    setAddress(data);
  };

  useEffect(() => {
    if (actionData?.ok) navigate(-1);
  }, [actionData]);

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
            options={business.map((code) => ({
              label: code.name,
              value: code.id + "",
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
