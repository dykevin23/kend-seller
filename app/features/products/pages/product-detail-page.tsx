import { Form, useNavigate } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import ProductOptionCard, {
  type ProductOptionArrayProps,
} from "../components/product-option-card";
import { useState } from "react";
import ProductImageCard from "../components/product-image-card";
import type { Route } from "./+types/product-detail-page";
import ProductDeliveryCard from "../components/product-delivery-card";
import { Button } from "~/common/components/ui/button";
import ProductReturnCard from "../components/product-return-card";
import ProductDetailCard from "../components/product-detail-card";
import ProductBasicCard from "../components/product-basic-card";
import ProductDescriptionCard, {
  type DescriptionImage,
} from "../components/product-description-card";
import { type ProductImage } from "../components/product-image-card";
import { makeSSRClient } from "~/supa-client";
import { getCategories, getSystemOptionsByDomain } from "~/features/system/queries";
import { getSellerInfo, getSellerAddresses } from "~/features/seller/queries";
import { getProductById, getProductIdByCode } from "../queries";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const productCode = params.productCode;

  // 판매자 정보
  const seller = await getSellerInfo(client);
  if (!seller) {
    throw new Response("판매자 정보를 찾을 수 없습니다", { status: 404 });
  }

  // product_code로 id 조회
  const productId = await getProductIdByCode(client, productCode, seller.id);
  if (!productId) {
    throw new Response("상품을 찾을 수 없습니다", { status: 404 });
  }

  // 상품 상세 정보 조회
  const product = await getProductById(client, productId, seller.id);
  if (!product) {
    throw new Response("상품을 찾을 수 없습니다", { status: 404 });
  }

  // 기본정보
  const categories = await getCategories(client);

  // 시스템 옵션 (판매자 domain에 맞는 옵션)
  const systemOptions = seller?.domain_id
    ? await getSystemOptionsByDomain(client, seller.domain_id)
    : [];

  // 판매자 주소 목록
  const addressList = await getSellerAddresses(client, seller.id);

  return { product, addressList, categories, systemOptions };
};

export default function ProductDetailPage({ loaderData }: Route.ComponentProps) {
  const { product, addressList, categories, systemOptions } = loaderData;
  const navigate = useNavigate();

  // 옵션 데이터 변환 (DB에서 가져온 데이터를 컴포넌트 형식으로)
  const convertOptionsToComponentFormat = (): ProductOptionArrayProps[] => {
    return product.stock_keepings.map((sku, index) => ({
      id: sku.sku_code || `sku-${index}`,
      options: sku.options || {},
      stocks: sku.stock,
      regularPrice: sku.regular_price,
      salePrice: sku.sale_price,
    }));
  };

  // URL에서 파일명 추출
  const getFileNameFromUrl = (url: string): string => {
    const parts = url.split("/");
    return parts[parts.length - 1] || "";
  };

  // 이미지 데이터 변환
  const convertMainImage = (): ProductImage | undefined => {
    const mainImg = product.images.find((img) => img.type === "MAIN");
    if (mainImg) {
      return {
        url: mainImg.url,
        fileName: getFileNameFromUrl(mainImg.url),
      };
    }
    return undefined;
  };

  const convertAdditionalImages = (): ProductImage[] => {
    return product.images
      .filter((img) => img.type === "ADDITIONAL")
      .map((img) => ({
        url: img.url,
        fileName: getFileNameFromUrl(img.url),
      }));
  };

  const convertDescriptionImages = (): DescriptionImage[] => {
    return product.descriptions
      .filter((desc) => desc.type === "IMAGE")
      .map((desc) => ({
        url: desc.content,
        fileName: getFileNameFromUrl(desc.content),
      }));
  };

  const [productOptions, setProductOptions] = useState<ProductOptionArrayProps[]>(
    convertOptionsToComponentFormat()
  );
  const [mainImage, setMainImage] = useState<ProductImage | undefined>(
    convertMainImage()
  );
  const [additionalImages, setAdditionalImages] = useState<ProductImage[]>(
    convertAdditionalImages()
  );
  const [descriptionImages, setDescriptionImages] = useState<DescriptionImage[]>(
    convertDescriptionImages()
  );

  return (
    <Content>
      <Title title="상품 상세" />

      <Form className="space-y-5" method="post">
        {/* 상품 기본정보 */}
        <ProductBasicCard
          categories={categories}
          defaultValues={{
            productName: product.name,
            targetGender: product.target_gender,
            targetAge: product.target_age,
            domainId: product.domain_id,
            mainCategory: product.main_category,
            subCategory: product.sub_category,
          }}
        />

        {/* 상품 옵션 */}
        <ProductOptionCard
          data={productOptions}
          setData={setProductOptions}
          systemOptions={systemOptions}
        />

        {/* 상품 이미지 */}
        <ProductImageCard
          options={productOptions}
          storageFolder={product.storage_folder}
          mainImage={mainImage}
          setMainImage={setMainImage}
          additionalImages={additionalImages}
          setAdditionalImages={setAdditionalImages}
        />

        {/* 상세설명 */}
        <ProductDescriptionCard
          storageFolder={product.storage_folder}
          images={descriptionImages}
          setImages={setDescriptionImages}
        />

        {/* 상품 상세정보 */}
        <ProductDetailCard
          defaultValues={{
            brand: product.detail?.brand || "",
            maker: product.detail?.maker || "",
          }}
        />

        {/* 배송지 */}
        <ProductDeliveryCard
          addressList={addressList}
          defaultValues={
            product.delivery
              ? {
                  addressId: product.delivery.address_id,
                  islandDelivery: product.delivery.island_delivery,
                  courierCompany: product.delivery.courier_company,
                  deliveryMethod: product.delivery.delivery_method,
                  bundleDelivery: product.delivery.bundle_delivery,
                  shippingFeeType: product.delivery.shipping_fee_type,
                  shippingFee: product.delivery.shipping_fee,
                  freeShippingCondition: product.delivery.free_shipping_condition,
                  shippingDays: product.delivery.shipping_days,
                }
              : undefined
          }
        />

        {/* 반품/교환 */}
        <ProductReturnCard
          addressList={addressList}
          defaultValues={
            product.return_info
              ? {
                  returnAddressId: product.return_info.address_id,
                  initialShippingFee: product.return_info.initial_shipping_fee,
                  returnShippingFee: product.return_info.return_shipping_fee,
                }
              : undefined
          }
        />

        {/* Hidden inputs for state data */}
        <input type="hidden" name="storageFolder" value={product.storage_folder} />
        <input type="hidden" name="productId" value={product.id} />
        <input
          type="hidden"
          name="productOptions"
          value={JSON.stringify(productOptions)}
        />
        <input
          type="hidden"
          name="mainImage"
          value={mainImage ? JSON.stringify(mainImage) : ""}
        />
        <input
          type="hidden"
          name="additionalImages"
          value={JSON.stringify(additionalImages)}
        />
        <input
          type="hidden"
          name="descriptionImages"
          value={JSON.stringify(descriptionImages)}
        />
        <input
          type="hidden"
          name="systemOptions"
          value={JSON.stringify(systemOptions)}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate("/products")}>
            목록
          </Button>
          <Button type="submit">수정</Button>
        </div>
      </Form>
    </Content>
  );
}
