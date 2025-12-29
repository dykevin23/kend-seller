import { Form } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import ProductOptionCard, {
  type ProductOptionArrayProps,
} from "../components/product-option-card";
import { useState } from "react";
import ProductImageCard from "../components/product-image-card";
import type { Route } from "./+types/submit-product-page";
import ProductDeliveryCard from "../components/product-delivery-card";
import { Button } from "~/common/components/ui/button";
import { z } from "zod";
import ProductReturnCard from "../components/product-return-card";
import ProductDetailCard from "../components/product-detail-card";
import ProductBasicCard from "../components/product-basic-card";
import ProductDescriptionCard from "../components/product-description-card";
import { makeSSRClient } from "~/supa-client";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);

  // 기본정보

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
        {/* 상품 기본정보 */}
        <ProductBasicCard />

        {/* 상품 옵션 */}
        <ProductOptionCard data={productOptions} setData={setProductOptions} />

        <ProductImageCard options={productOptions} />

        <ProductDescriptionCard />

        {/* 상품 상세정보 */}
        <ProductDetailCard />

        {/* 배송지 */}
        <ProductDeliveryCard />

        {/* 반품/교환 */}
        <ProductReturnCard />

        <div className="flex justify-end">
          <Button type="submit">등록</Button>
        </div>
      </Form>
    </Content>
  );
}
