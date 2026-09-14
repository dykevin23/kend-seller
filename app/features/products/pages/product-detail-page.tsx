import { Form, useNavigate } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import Card from "~/common/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";
import { useEffect, useState } from "react";
import ProductImageCard from "../components/product-image-card";
import type { Route } from "./+types/product-detail-page";
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
import { formatNumber } from "~/common/utils/format";
import { makeSSRClient } from "~/supa-client";
import { getCategories, getSystemOptionsByDomain } from "~/features/system/queries";
import { getSellerInfo, getSellerAddresses } from "~/features/seller/queries";
import { getProductById, getProductIdByCode } from "../queries";
import {
  updateProduct,
  updateProductDetail,
  replaceProductImages,
  replaceProductDescriptions,
  updateProductDelivery,
  updateProductReturn,
  createProductOptions,
  createProductStockKeepings,
} from "../mutations";
import AddProductOptionCard, {
  type NewSkuRow,
} from "../components/product-add-option-card";

// 등록 화면(submit-product-page.tsx)과 동일한 필드 구성 — 수정도 결국
// 같은 카드들을 재사용하므로 스키마도 맞춰야 함
const formSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1, "상품명을 입력해주세요"),
  targetGender: z.string().min(1, "대상 성별을 선택해주세요"),
  targetAge: z.string().min(1, "대상 연령을 선택해주세요"),
  domainId: z.string().min(1, "도메인 정보가 필요합니다"),
  mainCategory: z.string().min(1, "카테고리를 선택해주세요"),
  subCategory: z.string().min(1, "상세 카테고리를 선택해주세요"),

  brand: z.string().optional(),
  maker: z.string().min(1, "제조사를 입력해주세요"),

  mainImage: z
    .string()
    .optional()
    .transform((val) => {
      try {
        return val ? JSON.parse(val) : null;
      } catch {
        return null;
      }
    }),
  additionalImages: z
    .string()
    .optional()
    .transform((val) => {
      try {
        return val ? JSON.parse(val) : [];
      } catch {
        return [];
      }
    }),
  descriptionImages: z
    .string()
    .optional()
    .transform((val) => {
      try {
        return val ? JSON.parse(val) : [];
      } catch {
        return [];
      }
    }),
  addressId: z.string().min(1, "배송지를 선택해주세요"),
  islandDelivery: z.string().default("AVAILABLE"),
  courierCompany: z.string().default("CJ"),
  deliveryMethod: z.string().default("STANDARD"),
  bundleDelivery: z.string().default("AVAILABLE"),
  shippingFeeType: z.string().default("FREE"),
  shippingFee: z.string().optional().transform((val) => Number(val) || 0),
  freeShippingCondition: z.string().optional().transform((val) => Number(val) || 0),
  shippingDays: z.string().transform((val) => Number(val) || 1),

  returnAddressId: z.string().min(1, "반품지를 선택해주세요"),
  initialShippingFee: z.string().optional().transform((val) => Number(val) || 0),
  returnShippingFee: z.string().optional().transform((val) => Number(val) || 0),

  // 새로 추가된 옵션 값에 대한 SKU들 (기존 SKU는 이 화면에서 다루지 않음)
  newSkus: z
    .string()
    .optional()
    .transform((val) => {
      try {
        return val ? (JSON.parse(val) as NewSkuRow[]) : [];
      } catch {
        return [];
      }
    }),
  systemOptions: z
    .string()
    .optional()
    .transform((val) => {
      try {
        return val ? JSON.parse(val) : [];
      } catch {
        return [];
      }
    }),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();

  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );
  if (!success) {
    console.error("Validation error:", error);
    return { ok: false, error: error.issues[0].message };
  }

  const seller = await getSellerInfo(client);
  if (!seller) {
    return { ok: false, error: "판매자 정보를 찾을 수 없습니다" };
  }

  try {
    const productId = data.productId;

    await updateProduct(client, productId, {
      name: data.productName,
      target_gender: data.targetGender,
      target_age: data.targetAge,
      domain_id: data.domainId,
      main_category: data.mainCategory,
      sub_category: data.subCategory,
    });

    await updateProductDetail(client, productId, {
      brand: data.brand || null,
      maker: data.maker,
    });

    // 기존 SKU의 가격·재고 수정/삭제는 이 화면에서 다루지 않음(별도
    // 재고관리 화면에서 다루기로 결정됨, 2026-09) — 다만 기존 옵션 축에
    // 새 값을 추가하는 것은 기존 SKU를 전혀 건드리지 않는 순수 INSERT라
    // 안전하므로 허용한다. 서버에서 다시 한번 기존 데이터와 대조해
    // 중복(이미 존재하는 옵션값/조합)을 걸러낸다.
    if (data.newSkus.length > 0) {
      const currentProduct = await getProductById(client, productId, seller.id);
      if (!currentProduct) {
        return { ok: false, error: "상품을 찾을 수 없습니다" };
      }

      const existingOptionKeys = new Set(
        currentProduct.options.map(
          (opt) => `${opt.system_option_id}-${opt.option}`
        )
      );
      const existingSkuKeys = new Set(
        currentProduct.stock_keepings.map((sku) =>
          JSON.stringify(Object.entries(sku.options || {}).sort())
        )
      );

      const systemOptionsMap: Record<string, string> = {};
      (data.systemOptions || []).forEach((opt: any) => {
        systemOptionsMap[opt.code] = opt.id;
      });

      const allNewOptions: Array<{
        product_id: string;
        system_option_id: string;
        option: string;
      }> = [];
      data.newSkus.forEach((sku) => {
        Object.entries(sku.options).forEach(([code, value]) => {
          const systemOptionId = systemOptionsMap[code];
          if (!systemOptionId) return;
          allNewOptions.push({
            product_id: productId,
            system_option_id: systemOptionId,
            option: value,
          });
        });
      });

      const uniqueNewOptions = Array.from(
        new Map(
          allNewOptions.map((item) => [
            `${item.system_option_id}-${item.option}`,
            item,
          ])
        ).values()
      ).filter(
        (item) =>
          !existingOptionKeys.has(`${item.system_option_id}-${item.option}`)
      );

      if (uniqueNewOptions.length > 0) {
        await createProductOptions(client, uniqueNewOptions);
      }

      const newStockKeepings = data.newSkus
        .filter(
          (sku) =>
            !existingSkuKeys.has(
              JSON.stringify(Object.entries(sku.options).sort())
            )
        )
        .map((sku) => ({
          product_id: productId,
          options: sku.options,
          stock: sku.stocks,
          regular_price: sku.regularPrice,
          sale_price: sku.salePrice,
          status: "PREPARE" as const,
        }));

      if (newStockKeepings.length > 0) {
        await createProductStockKeepings(client, newStockKeepings);
      }
    }

    const images: Array<{ type: string; url: string }> = [];
    if (data.mainImage) {
      images.push({ type: "MAIN", url: data.mainImage.url });
    }
    if (data.additionalImages && data.additionalImages.length > 0) {
      data.additionalImages.forEach((img: any) => {
        images.push({ type: "ADDITIONAL", url: img.url });
      });
    }
    await replaceProductImages(client, productId, images);

    const descriptions = (data.descriptionImages || []).map((img: any) => ({
      type: "IMAGE" as const,
      content: img.url,
    }));
    await replaceProductDescriptions(client, productId, descriptions);

    await updateProductDelivery(client, productId, {
      address_id: data.addressId,
      island_delivery: data.islandDelivery,
      courier_company: data.courierCompany,
      delivery_method: data.deliveryMethod,
      bundle_delivery: data.bundleDelivery,
      shipping_fee_type: data.shippingFeeType,
      shipping_fee: data.shippingFee,
      free_shipping_condition: data.freeShippingCondition,
      shipping_days: data.shippingDays,
    });

    await updateProductReturn(client, productId, {
      address_id: data.returnAddressId,
      initial_shipping_fee: data.initialShippingFee,
      return_shipping_fee: data.returnShippingFee,
    });

    return { ok: true };
  } catch (err) {
    console.error("Product update error:", err);
    return { ok: false, error: "상품 수정에 실패했습니다" };
  }
};

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

export default function ProductDetailPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { product, addressList, categories, systemOptions } = loaderData;
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData?.ok) {
      alert("상품 수정이 완료되었습니다.");
    } else if (actionData?.error) {
      alert(actionData.error);
    }
  }, [actionData]);

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

  const [mainImage, setMainImage] = useState<ProductImage | undefined>(
    convertMainImage()
  );
  const [additionalImages, setAdditionalImages] = useState<ProductImage[]>(
    convertAdditionalImages()
  );
  const [descriptionImages, setDescriptionImages] = useState<DescriptionImage[]>(
    convertDescriptionImages()
  );
  const [newSkus, setNewSkus] = useState<NewSkuRow[]>([]);

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

        {/* 기존 상품 옵션 (읽기 전용) — 이미 등록된 SKU의 가격/재고
            수정·삭제는 이 화면에서 다루지 않는다(별도 재고관리 화면 예정).
            새 옵션값 추가는 아래 카드에서 별도로 가능하다 */}
        <Card>
          <h2 className="text-xl font-bold">상품 옵션</h2>
          <p className="text-sm text-muted-foreground">
            기존에 등록된 옵션 조합의 가격/재고는 이 화면에서 수정할 수
            없습니다. 가격/재고 수정은 재고관리 화면에서 진행할
            예정입니다(준비 중). 새로운 옵션값 추가는 아래에서 가능합니다.
          </p>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead>SKU</TableHead>
                <TableHead>옵션</TableHead>
                <TableHead className="text-right">정상가</TableHead>
                <TableHead className="text-right">판매가</TableHead>
                <TableHead className="text-right">재고</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.stock_keepings.length > 0 ? (
                product.stock_keepings.map((sku) => (
                  <TableRow key={sku.sku_code}>
                    <TableCell className="py-3">{sku.sku_code}</TableCell>
                    <TableCell className="py-3">
                      {Object.entries(sku.options || {})
                        .map(
                          ([key, value]) =>
                            `${systemOptions.find((opt) => opt.code === key)?.name ?? key}: ${value}`
                        )
                        .join(" / ") || "-"}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      {formatNumber(sku.regular_price)}원
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      {formatNumber(sku.sale_price)}원
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      {formatNumber(sku.stock)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    등록된 옵션이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* 새 옵션 추가 — 기존 옵션 축에 새 값 추가만 허용, 기존 SKU는
            건드리지 않는 순수 INSERT만 발생한다 */}
        <AddProductOptionCard
          existingOptions={product.options}
          systemOptions={systemOptions}
          data={newSkus}
          setData={setNewSkus}
        />

        {/* 상품 이미지 */}
        <ProductImageCard
          options={[]}
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
        <input type="hidden" name="newSkus" value={JSON.stringify(newSkus)} />
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
