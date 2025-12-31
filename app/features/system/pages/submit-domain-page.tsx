import { Form, redirect, useNavigate } from "react-router";
import Card from "~/common/components/card";
import Content from "~/common/components/content";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import Title from "~/common/components/title";
import { Button } from "~/common/components/ui/button";
import type { Route } from "./+types/submit-domain-page";
import { z } from "zod";
import { createDomain } from "../mutations";
import { makeSSRClient } from "~/supa-client";

export const formSchema = z.object({
  code: z.string().min(3),
  name: z.string().min(1),
  useYn: z.string(),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!success) {
    return { formErrors: error.flatten().fieldErrors };
  }

  const { client, headers } = makeSSRClient(request);
  await createDomain(client, data);
  return redirect("/system/domains");
};

export default function SubmitDomainPage({ actionData }: Route.ComponentProps) {
  const navigate = useNavigate();

  return (
    <Content>
      <Title title="도메인 등록" />

      <Form method="post">
        <Card>
          <div className="grid grid-cols-2">
            <div className="space-y-5">
              <TextField id="code" name="code" label="도메인 코드" />
              <TextField id="name" name="name" label="도메인 명" />
              <Select
                id="useYn"
                name="useYn"
                label="사용유무"
                options={[
                  { label: "사용", value: "Y" },
                  { label: "사용안함", value: "N" },
                ]}
              />
            </div>
          </div>
        </Card>
        <div className="flex pt-10 w-full space-x-1 justify-end">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button size="sm" type="submit">
            등록
          </Button>
        </div>
      </Form>
    </Content>
  );
}
