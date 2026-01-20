import { Form, redirect } from "react-router";
import Card from "~/common/components/card";
import Content from "~/common/components/content";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import Title from "~/common/components/title";
import { Button } from "~/common/components/ui/button";
import { z } from "zod";
import { makeSSRClient } from "~/supa-client";
import { updateSystemOption } from "../mutations";
import { getDomains, getSystemOptionByCode } from "../queries";
import type { Route } from "./+types/system-option-page";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  // URL의 code로 조회
  const systemOption = await getSystemOptionByCode(client, params.optionCode);
  const domains = await getDomains(client);

  return { systemOption, domains };
};

export const formSchema = z.object({
  domainId: z.string().optional(),
  code: z.string().min(1, "옵션 코드는 필수입니다"),
  name: z.string().min(1, "옵션명은 필수입니다"),
});

export const action = async ({ request, params }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!success) {
    return { formErrors: error.flatten().fieldErrors };
  }

  const { domainId, code, name } = data;
  const { client } = makeSSRClient(request);

  // URL의 code로 id를 조회한 후 update
  const systemOption = await getSystemOptionByCode(client, params.optionCode);
  await updateSystemOption(client, {
    id: systemOption.id,
    domainId,
    code,
    name,
  });
  return redirect("/system/systemOptions");
};

export default function SystemOptionPage({
  loaderData,
}: Route.ComponentProps) {
  const { systemOption, domains } = loaderData;

  return (
    <Content>
      <Title title="시스템 옵션 수정" />
      <Form className="space-y-5" method="post">
        <Card>
          <Select
            id="domainId"
            name="domainId"
            label="도메인"
            direction="row"
            className="w-1/2"
            value={systemOption.domain_id ? String(systemOption.domain_id) : undefined}
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
            defaultValue={systemOption.code}
            placeholder="예: SIZE, COLOR"
          />
          <TextField
            id="name"
            name="name"
            label="옵션명"
            direction="row"
            className="w-1/2"
            defaultValue={systemOption.name}
            placeholder="예: 사이즈, 색상"
          />
        </Card>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" asChild>
            <a href="/system/systemOptions">취소</a>
          </Button>
          <Button type="submit">수정</Button>
        </div>
      </Form>
    </Content>
  );
}
