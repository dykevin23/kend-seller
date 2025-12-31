import { Form, redirect } from "react-router";
import Card from "~/common/components/card";
import Content from "~/common/components/content";
import TextField from "~/common/components/text-field";
import Title from "~/common/components/title";
import { Button } from "~/common/components/ui/button";
import { z } from "zod";
import { makeSSRClient } from "~/supa-client";
import { createCommonCodeGroup } from "../mutations";
import type { Route } from "./+types/submit-common-code-group-page";

export const formSchema = z.object({
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

  const { code, name } = data;
  const { client, headers } = makeSSRClient(request);
  await createCommonCodeGroup(client, { code, name });
  return redirect("/system/commonCodes");
};

export default function SubmitCommonCodeGroupPage() {
  return (
    <Content>
      <Title title="공통코드 그룹등록" />
      <Form className="space-y-5" method="post">
        <Card>
          <TextField
            id="code"
            name="code"
            label="그룹코드"
            direction="row"
            className="w-1/2"
          />
          <TextField
            id="name"
            name="name"
            label="그룹코드명"
            direction="row"
            className="w-1/2"
          />
        </Card>
        <div className="flex justify-end">
          <Button type="submit">등록</Button>
        </div>
      </Form>
    </Content>
  );
}
