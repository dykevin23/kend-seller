import { Form, Link } from "react-router";
import Card from "~/common/components/card";
import TextField from "~/common/components/text-field";
import { Button } from "~/common/components/ui/button";
import { Separator } from "~/common/components/ui/separator";

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center bg-gray-300 h-screen">
      <Form className="flex flex-col p-10 bg-white rounded-md gap-4">
        <div className="flex flex-col gap-2">
          <TextField />
          <TextField />
        </div>

        <div>
          <Button size="lg" className="w-full">
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
