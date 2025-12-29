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
import { Form } from "react-router";
import { Button } from "~/common/components/ui/button";
import { useState } from "react";
import { z } from "zod";

const formSchema = z.object({
  bizrNo: z.string().length(10),
  representativeName: z.string().min(2),
  companyName: z.string().min(1),
  zoneCode: z.string().max(6),
  address: z.string(),
  addressDetail: z.string(),
  domain: z.string(),
});
export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );

  console.log("### result => ", success, data, error);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);
  const domains = await getDomains(client);

  return { domains };
};

export default function SubmitSellerInformationPage({
  loaderData,
}: Route.ComponentProps) {
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
            label="비즈니스 형태"
            options={[]}
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
