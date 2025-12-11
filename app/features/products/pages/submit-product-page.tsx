import { Form } from "react-router";
import Card from "~/common/components/card";
import Content from "~/common/components/content";
import RadioGroup from "~/common/components/radio-group";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import Title from "~/common/components/title";
import { products_main_category } from "~/seeds";
import ProductOptionCard, {
  type ProductOptionArrayProps,
} from "../components/product-option-card";
import { useState } from "react";
import ProductImageCard from "../components/product-image-card";
import type { Route } from "./+types/submit-product-page";
import ProductDeliveryCard from "../components/product-delivery-card";
import { Button } from "~/common/components/ui/button";
import { z } from "zod";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const addressList = [];

  return { addressList };
};

const formSchema = z.object({
  productName: z.string().min(1),
  sex: z.string(),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );

  console.log("### success / data / error => ", success, data, error);
};

export default function SubmitProductPage({
  loaderData,
}: Route.ComponentProps) {
  const [productOptions, setProductOptions] = useState<
    ProductOptionArrayProps[]
  >([]);

  return (
    <Content className="">
      <Title title="상품 등록" />

      {/* <Form className="grid grid-cols-2 gap-10 mx-auto"> */}
      <Form className="space-y-5" method="post">
        <Card>
          <h2 className="text-xl font-bold">상품 기본정보</h2>
          <div className="grid grid-cols-2 gap-10 mx-auto">
            <div className="space-y-5">
              <TextField id="productName" name="productName" label="상품명" />
              <RadioGroup
                label="성별"
                name="sex"
                options={[
                  { label: "남성", value: "male" },
                  { label: "여성", value: "female" },
                  { label: "남녀공용", value: "unisex" },
                ]}
              />
            </div>
            <div className="space-y-5">
              <TextField
                id="classification_code"
                name="classification_code"
                label="상품분류"
                value="패션"
                disabled
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-10 mx-auto">
            <div className="space-y-5">
              <Select
                label="카테고리"
                options={products_main_category.map((item) => {
                  return { label: item.group_name, value: item.group_code };
                })}
              />
            </div>
            <div className="space-y-5">
              <Select label="상세 카테고리" options={[]} />
            </div>
          </div>
        </Card>

        <ProductOptionCard data={productOptions} setData={setProductOptions} />

        <ProductImageCard />
        {/* <div className="space-y-5">
          <Editor />
        </div> */}

        {/* 배송지 */}
        <ProductDeliveryCard />

        <div className="flex justify-end">
          <Button type="submit">등록</Button>
        </div>
      </Form>
    </Content>
  );
}
