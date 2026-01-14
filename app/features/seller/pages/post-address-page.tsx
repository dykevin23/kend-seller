import { z } from "zod";
import type { Route } from "./+types/post-address-page";
import { makeSSRClient } from "~/supa-client";
import { getSellerInfo } from "../queries";

const formSchema = z.object({
  addressName: z.string().min(1, "주소지명을 입력해주세요"),
  zoneCode: z.string().min(1, "우편번호를 선택해주세요"),
  address: z.string().min(1, "주소를 선택해주세요"),
  addressDetail: z.string().min(1, "상세주소를 입력해주세요"),
  addressType: z.enum(["SHIPPING", "RETURN"]),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();

  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!success) {
    return { ok: false, error: error.issues[0].message };
  }

  // 판매자 정보 가져오기
  const seller = await getSellerInfo(client);
  if (!seller) {
    return { ok: false, error: "판매자 정보를 찾을 수 없습니다" };
  }

  // 주소 등록
  const { error: insertError } = await client
    .from("admin_seller_address")
    .insert({
      seller_id: seller.id,
      address_name: data.addressName,
      zone_code: data.zoneCode,
      address: data.address,
      address_detail: data.addressDetail,
      address_type: data.addressType,
    });

  if (insertError) {
    console.error("주소 등록 오류:", insertError);
    return { ok: false, error: "주소 등록에 실패했습니다" };
  }

  return { ok: true };
};
