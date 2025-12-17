import { Form, Link, redirect } from "react-router";
import TextField from "~/common/components/text-field";
import { Button } from "~/common/components/ui/button";
import { Separator } from "~/common/components/ui/separator";
import type { Route } from "./+types/join-page";
import { z } from "zod";
import { makeSSRClient } from "~/supa-client";

const formSchema = z.object({
  username: z.string().min(3),
  email: z.email(),
  password: z.string().min(8),
  password_check: z.string().min(8),
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

  // username 중복체크

  if (data.password !== data.password_check) {
    return {
      formErrors: { password: ["패스워드가 일치하지 않습니다."] },
    };
  }

  const { client, headers } = makeSSRClient(request);
  const { error: signUpError } = await client.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        username: data.username,
        role: "seller",
      },
    },
  });

  if (signUpError) {
    console.log("### signUpError => ", signUpError);
    return {
      signUpError: signUpError.message,
    };
  }

  return redirect("/", { headers });
};

export default function JoinPage({ actionData }: Route.ComponentProps) {
  console.log("### actionData => ", actionData);
  return (
    <div className="flex justify-center items-center bg-gray-300 h-screen">
      <Form
        className="flex flex-col p-10 bg-white rounded-md gap-4"
        method="post"
      >
        <div className="flex flex-col gap-2">
          <TextField id="email" name="email" placeholder="이메일" />
          {actionData && "formErrors" in actionData && (
            <p className="text-sm text-red-500">
              {actionData?.formErrors?.email}
            </p>
          )}
          <TextField
            id="password"
            name="password"
            type="password"
            placeholder="패스워드"
          />
          <TextField
            id="password_check"
            name="password_check"
            type="password"
            placeholder="패스워드 확인"
          />
          {actionData && "formErrors" in actionData && (
            <p className="text-sm text-red-500">
              {actionData?.formErrors?.password}
            </p>
          )}
          <TextField id="username" name="username" placeholder="이름" />
          {actionData && "formErrors" in actionData && (
            <p className="text-sm text-red-500">
              {actionData?.formErrors?.username}
            </p>
          )}
        </div>

        <Separator />

        <Button type="submit" size="lg" className="text-xs">
          가입하기
        </Button>
        <div className="flex justify-center gap-1">
          <span className="text-xs">이미 계정이 있으신가요?</span>

          <Link to="/auth/login" className="text-xs text-blue-500">
            로그인
          </Link>
        </div>
      </Form>
    </div>
  );
}
