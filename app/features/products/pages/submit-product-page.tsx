import { Form } from "react-router";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";

export default function SubmitProductPage() {
  return (
    <div>
      <div className="pb-4">
        <h1 className="text-3xl font-bold">상품 등록</h1>
      </div>

      {/* <Form className="grid grid-cols-2 gap-10 mx-auto"> */}
      <Form>
        <div className="flex flex-col space-y-2">
          <Label htmlFor="name">상품명</Label>
          <Input id="name" />
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="name">상품명</Label>
          <Input id="name" />
        </div>
      </Form>
    </div>
  );
}
