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

export default function LoginPage({ actionData }: Route.ComponentProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            K
          </span>
          <div className="text-center">
            <p className="text-lg font-bold tracking-tight">kend seller</p>
            <p className="text-sm text-muted-foreground">판매자센터에 로그인하세요</p>
          </div>
        </div>

        <Form
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-8 shadow-sm"
          method="post"
        >
          <div className="flex flex-col gap-2">
            <TextField id="email" name="email" placeholder="이메일" />
            <TextField
              id="password"
              name="password"
              placeholder="비밀번호"
              type="password"
            />
            {actionData?.loginError && (
              <p className="text-sm text-destructive">{actionData.loginError}</p>
            )}
          </div>

          <div>
            <Button size="lg" className="w-full" type="submit">
              로그인
            </Button>
            <div className="mt-1 flex justify-center gap-4">
              <Button variant="link" className="text-xs text-muted-foreground" size="sm">
                아이디 찾기
              </Button>
              <Button variant="link" className="text-xs text-muted-foreground" size="sm">
                비밀번호 찾기
              </Button>
            </div>
          </div>

          <Separator />

          <Button size="lg" variant="outline" type="button" asChild>
            <Link to="/auth/join">회원가입</Link>
          </Button>
        </Form>
      </div>
    </div>
  );
}
