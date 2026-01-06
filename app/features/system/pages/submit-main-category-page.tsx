import { Form, redirect, useNavigate, useOutletContext } from "react-router";
import Card from "~/common/components/card";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import { Button } from "~/common/components/ui/button";
import type { Route } from "./+types/submit-main-category-page";
import { z } from "zod";
import { makeSSRClient } from "~/supa-client";
import { createMainCategory } from "../mutations";

export const formSchema = z.object({
  domainId: z.string(),
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

  const { domainId, code, name } = data;
  const { client } = makeSSRClient(request);
  const mainCategoryId = await createMainCategory(client, {
    domainId,
    code,
    name,
  });

  return redirect("/system/categories");
};

export default function SubmitMainCategoryPage() {
  const navigate = useNavigate();
  const { domains } = useOutletContext<{
    domains: any;
  }>();

  return (
    <Form method="post" className="space-y-5">
      <Card>
        <h2 className="text-xl font-bold">카테고리 등록</h2>
        <div className="grid grid-cols-2">
          <div className="space-y-5">
            <Select
              id="domainId"
              name="domainId"
              label="서비스"
              options={domains.map((domain) => ({
                label: domain.name,
                value: String(domain.id),
              }))}
            />
            <TextField id="code" name="code" label="카테고리" />
            <TextField id="name" name="name" label="카테고리명" />
          </div>
        </div>
      </Card>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          취소
        </Button>
        <Button size="sm" type="submit">
          등록
        </Button>
      </div>
    </Form>
  );
}
