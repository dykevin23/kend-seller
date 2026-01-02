import { Form, redirect, useNavigate } from "react-router";
import Card from "~/common/components/card";
import Content from "~/common/components/content";
import TextField from "~/common/components/text-field";
import Title from "~/common/components/title";
import { Button } from "~/common/components/ui/button";
import type { Route } from "./+types/submit-common-code-page";
import { z } from "zod";
import { makeSSRClient } from "~/supa-client";
import { createCommonCode } from "../mutations";
import { useRootData } from "~/hooks/useRootData";

export const formSchema = z.object({
  group_id: z.string(),
  code: z.string().min(3),
  name: z.string().min(1),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!success) {
    return { formErrors: error.flatten().fieldErrors };
  }

  const { group_id, code, name } = data;
  const { client, headers } = makeSSRClient(request);
  await createCommonCode(client, { group_id, code, name });
  return redirect(`/system/commonCodes/group/${group_id}`);
};

export default function SubmitCommonCodePage({ params }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { commonCodes } = useRootData();

  const group = commonCodes?.find((item) => item.id + "" === params.groupId);

  return (
    <Content>
      <Title title="공통코드 등록" />
      <Form className="space-y-5" method="post">
        <Card>
          <TextField
            label="그룹코드"
            value={group?.code}
            readOnly
            direction="row"
            className="w-1/2 bg-gray-300"
          />
          <input
            className="hidden"
            id="group_id"
            name="group_id"
            value={params.groupId}
          />
          <TextField
            id="code"
            name="code"
            label="공통코드"
            direction="row"
            className="w-1/2"
          />
          <TextField
            id="name"
            name="name"
            label="공통코드명"
            direction="row"
            className="w-1/2"
          />
        </Card>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button type="submit">등록</Button>
        </div>
      </Form>
    </Content>
  );
}
