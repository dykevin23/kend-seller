import { Form, useNavigate } from "react-router";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import Title from "~/common/components/title";
import { Button } from "~/common/components/ui/button";
import type { Route } from "./+types/submit-service-page";
import { z } from "zod";

export const formSchema = z.object({
  code: z.string(),
  name: z.string(),
  useYn: z.string(),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );

  console.log("### formData => ", success, data, error);
};

export default function SubmitServicePage() {
  const navigate = useNavigate();

  return (
    <div>
      <Title title="서비스 등록" />

      <Form method="post">
        <div className="grid grid-cols-2">
          <div className="space-y-5">
            <TextField id="code" name="code" label="서비스 코드" />
            <TextField id="name" name="name" label="서비스 명" />
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
        <div className="flex pt-10 w-full space-x-1 justify-end">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            취소
          </Button>
          <Button size="sm" type="submit">
            등록
          </Button>
        </div>
      </Form>
    </div>
  );
}
