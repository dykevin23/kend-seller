import { Form, useNavigate } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import ProductOptionCard, {
  type ProductOptionArrayProps,
} from "../components/product-option-card";
import { useState, useMemo, useEffect } from "react";
import ProductImageCard from "../components/product-image-card";
import type { Route } from "./+types/submit-product-page";
import ProductDeliveryCard from "../components/product-delivery-card";
import { Button } from "~/common/components/ui/button";
import { z } from "zod";
import ProductReturnCard from "../components/product-return-card";
import ProductDetailCard from "../components/product-detail-card";
import ProductBasicCard from "../components/product-basic-card";
import ProductDescriptionCard, {
  type DescriptionImage,
} from "../components/product-description-card";
import { type ProductImage } from "../components/product-image-card";
import { makeSSRClient } from "~/supa-client";
import { getCategories, getSystemOptionsByDomain } from "~/features/system/queries";
import { useRootData } from "~/hooks/useRootData";
import { getSellerInfo, getSellerAddresses } from "~/features/seller/queries";
import {
  createProduct,
  createProductDetail,
  createProductOptions,
  createProductStockKeepings,
  createProductImages,
  createProductDescriptions,
  createProductDelivery,
  createProductReturn,
} from "../mutations";

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

// 전체 Form 스키마
const formSchema = z.object({
  // 기본정보
  productName: z.string().min(1, "상품명을 입력해주세요"),
  gender: z.string().min(1, "성별을 선택해주세요"),
  domainId: z.string().min(1, "도메인 정보가 필요합니다"),
  mainCategory: z.string().min(1, "카테고리를 선택해주세요"),
  subCategory: z.string().min(1, "상세 카테고리를 선택해주세요"),

  // 상품 상세정보
  brand: z.string().optional(),
  maker: z.string().min(1, "제조사를 입력해주세요"),

  // state로 관리되는 데이터들 (JSON 문자열로 전송)
  storageFolder: z.string(),
  productOptions: z.string().transform((val) => {
    try {
      return JSON.parse(val) as ProductOptionArrayProps[];
    } catch {
      return [];
    }
  }),
  mainImage: z.string().optional().transform((val) => {
    try {
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  }),
  additionalImages: z.string().optional().transform((val) => {
    try {
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  }),
  descriptionImages: z.string().optional().transform((val) => {
    try {
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  }),
  systemOptions: z.string().transform((val) => {
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }),

  // 배송정보
  addressId: z.string().min(1, "배송지를 선택해주세요"),
  islandDelivery: z.string().default("AVAILABLE"),
  courierCompany: z.string().default("CJ"),
  deliveryMethod: z.string().default("STANDARD"),
  bundleDelivery: z.string().default("AVAILABLE"),
  shippingFeeType: z.string().default("FREE"),
  shippingFee: z.string().optional().transform((val) => Number(val) || 0),
  freeShippingCondition: z.string().optional().transform((val) => Number(val) || 0),
  shippingDays: z.string().transform((val) => Number(val) || 1),

  // 반품/교환 정보
  returnAddressId: z.string().min(1, "반품지를 선택해주세요"),
  initialShippingFee: z.string().optional().transform((val) => Number(val) || 0),
  returnShippingFee: z.string().optional().transform((val) => Number(val) || 0),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();

  // validation
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!success) {
    console.error("Validation error:", error);
    return { ok: false, error: error.issues[0].message };
  }

  // 판매자 정보 가져오기
  const seller = await getSellerInfo(client);
  if (!seller) {
    return { ok: false, error: "판매자 정보를 찾을 수 없습니다" };
  }

  try {
    // 1. 상품 기본정보 저장
    const productId = await createProduct(client, {
      storage_folder: data.storageFolder,
      name: data.productName,
      gender: data.gender,
      domain_id: Number(data.domainId),
      main_category: data.mainCategory,
      sub_category: data.subCategory,
      seller_id: seller.id,
    });

    // 2. 상품 상세정보 저장
    await createProductDetail(client, {
      product_id: productId,
      brand: data.brand || null,
      maker: data.maker,
    });

    // 3. 상품 옵션 및 재고정보 저장
    if (data.productOptions.length > 0) {
      // systemOptions를 파싱하여 code -> id 매핑
      const systemOptionsMap = data.systemOptions.reduce((acc: any, opt: any) => {
        acc[opt.code] = opt.id;
        return acc;
      }, {});

      // 각 SKU별로 옵션 정보 추출
      const allOptions: Array<{
        product_id: number;
        system_option_id: number;
        option: string;
      }> = [];

      data.productOptions.forEach((sku) => {
        Object.entries(sku.options).forEach(([optionCode, optionValue]) => {
          allOptions.push({
            product_id: productId,
            system_option_id: systemOptionsMap[optionCode],
            option: optionValue as string,
          });
        });
      });

      // 중복 제거 (UI에서 방지하지만 서버에서 한번 더 체크)
      const uniqueOptions = Array.from(
        new Map(allOptions.map(item => [
          `${item.system_option_id}-${item.option}`,
          item
        ])).values()
      );

      await createProductOptions(client, uniqueOptions);

      // SKU 재고정보 저장
      const stockKeepings = data.productOptions.map((sku) => ({
        product_id: productId,
        sku_code: sku.id,
        stock: sku.stocks,
        regular_price: sku.regularPrice,
        sale_price: sku.salePrice,
        status: "PREPARE" as const,
      }));

      await createProductStockKeepings(client, stockKeepings);
    }

    // 4. 상품 이미지 저장
    const images: Array<{
      product_id: number;
      sku_id?: number | null;
      type: string;
      url: string;
    }> = [];

    // 대표이미지
    if (data.mainImage) {
      images.push({
        product_id: productId,
        sku_id: null,
        type: "MAIN",
        url: data.mainImage.url,
      });
    }

    // 추가이미지
    if (data.additionalImages && data.additionalImages.length > 0) {
      data.additionalImages.forEach((img: any) => {
        images.push({
          product_id: productId,
          sku_id: null,
          type: "ADDITIONAL",
          url: img.url,
        });
      });
    }

    if (images.length > 0) {
      await createProductImages(client, images);
    }

    // 5. 상품 상세설명 이미지 저장
    if (data.descriptionImages && data.descriptionImages.length > 0) {
      const descriptions = data.descriptionImages.map((img: any) => ({
        product_id: productId,
        type: "IMAGE" as const,
        content: img.url,
      }));

      await createProductDescriptions(client, descriptions);
    }

    // 6. 상품 배송정보 저장
    await createProductDelivery(client, {
      product_id: productId,
      address_id: Number(data.addressId),
      island_delivery: data.islandDelivery,
      courier_company: data.courierCompany,
      delivery_method: data.deliveryMethod,
      bundle_delivery: data.bundleDelivery,
      shipping_fee_type: data.shippingFeeType,
      shipping_fee: data.shippingFee,
      free_shipping_condition: data.freeShippingCondition,
      shipping_days: data.shippingDays,
    });

    // 7. 상품 반품/교환 정보 저장
    await createProductReturn(client, {
      product_id: productId,
      address_id: Number(data.returnAddressId),
      initial_shipping_fee: data.initialShippingFee,
      return_shipping_fee: data.returnShippingFee,
    });

    return { ok: true, productId };
  } catch (err) {
    console.error("Product creation error:", err);
    return { ok: false, error: "상품 등록에 실패했습니다" };
  }
};

export default function SubmitProductPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { seller } = useRootData();
  const navigate = useNavigate();
  const [productOptions, setProductOptions] = useState<
    ProductOptionArrayProps[]
  >([]);
  const [mainImage, setMainImage] = useState<ProductImage | undefined>();
  const [additionalImages, setAdditionalImages] = useState<ProductImage[]>([]);
  const [descriptionImages, setDescriptionImages] = useState<DescriptionImage[]>([]);

  // UUID 생성 (상품 이미지 저장용 폴더명)
  const storageFolder = useMemo(() => crypto.randomUUID(), []);

  // 등록 완료 시 처리
  useEffect(() => {
    if (actionData?.ok) {
      alert("상품 등록이 완료되었습니다.");
      navigate("/products");
    } else if (actionData?.error) {
      alert(actionData.error);
    }
  }, [actionData, navigate]);

  return (
    <Content className="">
      <Title title="상품 등록" />

      <Form className="space-y-5" method="post">
        {/* 상품 기본정보 */}
        <ProductBasicCard categories={loaderData.categories} />

        {/* 상품 옵션 */}
        <ProductOptionCard
          data={productOptions}
          setData={setProductOptions}
          systemOptions={loaderData.systemOptions}
        />

        {/* 상품 이미지 */}
        <ProductImageCard
          options={productOptions}
          storageFolder={storageFolder}
          mainImage={mainImage}
          setMainImage={setMainImage}
          additionalImages={additionalImages}
          setAdditionalImages={setAdditionalImages}
        />

        {/* 상세설명 */}
        <ProductDescriptionCard
          storageFolder={storageFolder}
          images={descriptionImages}
          setImages={setDescriptionImages}
        />

        {/* 상품 상세정보 */}
        <ProductDetailCard />

        {/* 배송지 */}
        <ProductDeliveryCard addressList={loaderData.addressList} />

        {/* 반품/교환 */}
        <ProductReturnCard addressList={loaderData.addressList} />

        {/* Hidden inputs for state data */}
        <input type="hidden" name="storageFolder" value={storageFolder} />
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
          value={JSON.stringify(loaderData.systemOptions)}
        />

        <div className="flex justify-end">
          <Button type="submit">등록</Button>
        </div>
      </Form>
    </Content>
  );
}
