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
      formErrors: { password: ["비밀번호가 일치하지 않습니다."] },
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
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            K
          </span>
          <div className="text-center">
            <p className="text-lg font-bold tracking-tight">kend seller</p>
            <p className="text-sm text-muted-foreground">판매자 계정을 만들어보세요</p>
          </div>
        </div>

        <Form
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-8 shadow-sm"
          method="post"
        >
          <div className="flex flex-col gap-2">
            <TextField id="email" name="email" placeholder="이메일" />
            {actionData && "formErrors" in actionData && (
              <p className="text-sm text-destructive">
                {actionData?.formErrors?.email}
              </p>
            )}
            <TextField
              id="password"
              name="password"
              type="password"
              placeholder="비밀번호"
            />
            <TextField
              id="password_check"
              name="password_check"
              type="password"
              placeholder="비밀번호 확인"
            />
            {actionData && "formErrors" in actionData && (
              <p className="text-sm text-destructive">
                {actionData?.formErrors?.password}
              </p>
            )}
            <TextField id="username" name="username" placeholder="이름" />
            {actionData && "formErrors" in actionData && (
              <p className="text-sm text-destructive">
                {actionData?.formErrors?.username}
              </p>
            )}
            {actionData && "signUpError" in actionData && (
              <p className="text-sm text-destructive">
                {actionData?.signUpError}
              </p>
            )}
          </div>

          <Separator />

          <Button type="submit" size="lg">
            가입하기
          </Button>
          <div className="flex justify-center gap-1.5">
            <span className="text-xs text-muted-foreground">이미 계정이 있으신가요?</span>
            <Link to="/auth/login" className="text-xs font-semibold text-primary">
              로그인
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
