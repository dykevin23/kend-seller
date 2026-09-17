import { Form, redirect, useNavigate } from "react-router";
import Card from "~/common/components/card";
import Content from "~/common/components/content";
import TextField from "~/common/components/text-field";
import Title from "~/common/components/title";
import Select from "~/common/components/select";
import { Label } from "~/common/components/ui/label";
import { Textarea } from "~/common/components/ui/textarea";
import { Button } from "~/common/components/ui/button";
import type { Route } from "./+types/submit-notice-page";
import { z } from "zod";
import { createNotice } from "../mutations";
import { NOTICE_TARGETS } from "../constrants";
import { makeSSRClient } from "~/supa-client";

export const formSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  target: z.enum(["ALL", "SELLER", "BUYER"]),
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
  await createNotice(client, data);
  return redirect("/system/notices");
};

export default function SubmitNoticePage({ actionData }: Route.ComponentProps) {
  const navigate = useNavigate();

  return (
    <Content>
      <Title title="공지사항 등록" />

      <Form method="post">
        <Card>
          <TextField id="title" name="title" label="제목" />
          {actionData && "formErrors" in actionData && (
            <p className="text-sm text-destructive">
              {actionData?.formErrors?.title}
            </p>
          )}
          <Select
            id="target"
            name="target"
            label="노출 대상"
            defaultValue="ALL"
            options={NOTICE_TARGETS.map((target) => ({
              label: target.label,
              value: target.value,
            }))}
          />
          <div className="flex flex-col w-full space-y-3">
            <Label htmlFor="content">본문</Label>
            <Textarea id="content" name="content" rows={10} />
          </div>
          {actionData && "formErrors" in actionData && (
            <p className="text-sm text-destructive">
              {actionData?.formErrors?.content}
            </p>
          )}
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
