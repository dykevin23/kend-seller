import { Form, Link, redirect } from "react-router";
import TextField from "~/common/components/text-field";
import { Button } from "~/common/components/ui/button";
import { Separator } from "~/common/components/ui/separator";
import type { Route } from "./+types/login-page";
import { z } from "zod";
import { makeSSRClient } from "~/supa-client";

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { success, error, data } = formSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!success) {
    return {
      formErrors: error.flatten().fieldErrors,
    };
  }

  const { email, password } = data;
  const { client, headers } = makeSSRClient(request);
  const { error: loginError } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError) {
    return {
      formErrors: null,
      loginError: loginError.message,
    };
  }
  return redirect("/", { headers });
};

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center bg-gray-300 h-screen">
      <Form
        className="flex flex-col p-10 bg-white rounded-md gap-4"
        method="post"
      >
        <div className="flex flex-col gap-2">
          <TextField id="email" name="email" placeholder="이메일" />
          <TextField
            id="password"
            name="password"
            placeholder="패스워드"
            type="password"
          />
        </div>

        <div>
          <Button size="lg" className="w-full" type="submit">
            로그인
          </Button>
          <div className="flex justify-around px-4">
            <Button variant="link" className="text-[10px]" size="sm">
              아이디 찾기
            </Button>
            <Button variant="link" className="text-[10px]" size="sm">
              비밀번호 찾기
            </Button>
          </div>
        </div>

        <Separator />

        <Button
          size="lg"
          variant="outline"
          className="text-xs"
          type="button"
          asChild
        >
          <Link to="/auth/join">회원가입</Link>
        </Button>
      </Form>
    </div>
  );
}
