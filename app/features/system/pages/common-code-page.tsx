import { Form, useNavigate } from "react-router";
import Card from "~/common/components/card";
import Content from "~/common/components/content";
import TextField from "~/common/components/text-field";
import Title from "~/common/components/title";
import { Button } from "~/common/components/ui/button";
import type { Route } from "./+types/common-code-page";
import { makeSSRClient } from "~/supa-client";
import { getAllCommonCodes } from "../queries";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const commonCodes = await getAllCommonCodes(client);
  return { commonCodes };
};

export default function CommonCodePage({
  params,
  loaderData,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const { commonCodes } = loaderData;

  const group = commonCodes.find((item) => item.code === params.groupCode);
  const commonCode = group?.children.find(
    (item) => item.code === params.codeValue
  );

  return (
    <Content>
      <Title title="공통코드 관리" />

      <Form className="space-y-5">
        <Card>
          <h2 className="text-xl font-bold">공통코드</h2>
          <TextField label="공통코드" value={commonCode?.code} />
          <TextField label="공통코드명" value={commonCode?.name} />
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button type="submit">수정</Button>
        </div>
      </Form>
    </Content>
  );
}
