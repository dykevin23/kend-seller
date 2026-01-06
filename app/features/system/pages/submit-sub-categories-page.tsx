import { Form, redirect, useNavigate, useOutletContext } from "react-router";
import Card from "~/common/components/card";
import type { Route } from "./+types/submit-sub-categories-page";
import { Button } from "~/common/components/ui/button";
import TextField from "~/common/components/text-field";
import { z } from "zod";
import { makeSSRClient } from "~/supa-client";
import { createSubCategory } from "../mutations";

export const formSchema = z.object({
  code: z.string().min(3),
  name: z.string().min(1),
});

export const action = async ({ request, params }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!success) {
    return { formErrors: error.flatten().fieldErrors };
  }
  const { code, name } = data;
  const { client } = makeSSRClient(request);

  await createSubCategory(client, {
    categoryId: params.categoryId,
    code: code,
    name: name,
  });

  return redirect(`/system/categories/${params.categoryId}`);
};

export default function SubmitSubCategoriesPage({
  params,
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const { categories } = useOutletContext<{ categories: any }>();
  const category = categories.find(
    (item) => item.id === Number(params.categoryId)
  );
  return (
    <Form method="post" className="space-y-5">
      <Card>
        <h2 className="text-xl font-bold">하위 카테고리 등록</h2>
        <div className="grid grid-cols-2">
          <div className="space-y-5">
            <TextField
              id="category"
              name="category"
              label="상위 카테고리"
              value={category?.name}
              disabled
            />
            <TextField id="code" name="code" label="하위 카테고리" />
            <TextField id="name" name="name" label="하위 카테고리명" />
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
