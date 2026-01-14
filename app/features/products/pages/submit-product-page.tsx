import { Form } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import ProductOptionCard, {
  type ProductOptionArrayProps,
} from "../components/product-option-card";
import { useEffect, useState, useMemo } from "react";
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
import { getCategories, getSystemOptionsByDomain } from "~/features/system/queries";
import { useRootData } from "~/hooks/useRootData";
import { getSellerInfo, getSellerAddresses } from "~/features/seller/queries";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client, headers } = makeSSRClient(request);

  // 판매자 정보
  const seller = await getSellerInfo(client);

  // 기본정보
  const categories = await getCategories(client);

  // 시스템 옵션 (판매자 domain에 맞는 옵션)
  const systemOptions = seller?.domain_id
    ? await getSystemOptionsByDomain(client, seller.domain_id)
    : [];

  // 판매자 주소 목록
  const addressList = seller?.id
    ? await getSellerAddresses(client, seller.id)
    : [];

  return { addressList, categories, systemOptions };
};

const formSchema = z.object({
  productName: z.string().min(1),
  gender: z.string(),
  domainId: z.string(),
  mainCategory: z.string(),
  subCategory: z.string(),
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
  const { seller } = useRootData();
  const [productOptions, setProductOptions] = useState<
    ProductOptionArrayProps[]
  >([]);

  // UUID 생성 (상품 이미지 저장용 폴더명)
  const storageFolder = useMemo(() => crypto.randomUUID(), []);

  useEffect(() => {
    console.log("### productOption useEffect => ", productOptions);
  }, [productOptions]);

  return (
    <Content className="">
      <Title title="상품 등록" />

      {/* <Form className="grid grid-cols-2 gap-10 mx-auto"> */}
      <Form className="space-y-5" method="post">
        {/* 상품 기본정보 */}
        <ProductBasicCard categories={loaderData.categories} />

        {/* 상품 옵션 */}
        <ProductOptionCard
          data={productOptions}
          setData={setProductOptions}
          systemOptions={loaderData.systemOptions}
        />

        <ProductImageCard options={productOptions} storageFolder={storageFolder} />

        <ProductDescriptionCard storageFolder={storageFolder} />

        {/* 상품 상세정보 */}
        <ProductDetailCard />

        {/* 배송지 */}
        <ProductDeliveryCard addressList={loaderData.addressList} />

        {/* 반품/교환 */}
        <ProductReturnCard addressList={loaderData.addressList} />

        <div className="flex justify-end">
          <Button type="submit">등록</Button>
        </div>
      </Form>
    </Content>
  );
}
