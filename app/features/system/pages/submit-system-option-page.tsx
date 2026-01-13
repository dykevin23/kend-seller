import { Form, redirect } from "react-router";
import Card from "~/common/components/card";
import Content from "~/common/components/content";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import Title from "~/common/components/title";
import { Button } from "~/common/components/ui/button";
import { z } from "zod";
import { makeSSRClient } from "~/supa-client";
import { createSystemOption } from "../mutations";
import { getDomains } from "../queries";
import type { Route } from "./+types/submit-system-option-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const domains = await getDomains(client);

  return { domains };
};

export const formSchema = z.object({
  domainId: z.string().optional(),
  code: z.string().min(1, "옵션 코드는 필수입니다"),
  name: z.string().min(1, "옵션명은 필수입니다"),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!success) {
    return { formErrors: error.flatten().fieldErrors };
  }

  const { domainId, code, name } = data;
  const { client } = makeSSRClient(request);
  await createSystemOption(client, { domainId, code, name });
  return redirect("/system/systemOptions");
};

export default function SubmitSystemOptionPage({
  loaderData,
}: Route.ComponentProps) {
  const { domains } = loaderData;

  return (
    <Content>
      <Title title="시스템 옵션 등록" />
      <Form className="space-y-5" method="post">
        <Card>
          <Select
            id="domainId"
            name="domainId"
            label="도메인"
            direction="row"
            className="w-1/2"
            options={domains.map((domain) => ({
              label: domain.name,
              value: String(domain.id),
            }))}
          />
          <TextField
            id="code"
            name="code"
            label="옵션 코드"
            direction="row"
            className="w-1/2"
            placeholder="예: SIZE, COLOR"
          />
          <TextField
            id="name"
            name="name"
            label="옵션명"
            direction="row"
            className="w-1/2"
            placeholder="예: 사이즈, 색상"
          />
        </Card>
        <div className="flex justify-end">
          <Button type="submit">등록</Button>
        </div>
      </Form>
    </Content>
  );
}
