import { z } from "zod";
import type { Route } from "./+types/post-banner-page";
import { makeSSRClient } from "~/supa-client";
import { getSellerInfo, getSellerBanners } from "../queries";
import {
  createSellerBanner,
  updateSellerBanner,
  swapBannerOrder,
  deleteSellerBannerRecord,
} from "../mutations";
import { MAX_BANNERS } from "../constrants";

const createSchema = z.object({
  intent: z.literal("create"),
  title: z.string().min(1, "제목을 입력해주세요"),
  imageUrl: z.string().url(),
  displayOrder: z.coerce.number().int().min(1),
});

const updateSchema = z.object({
  intent: z.literal("update"),
  bannerId: z.string().uuid(),
  isActive: z.enum(["true", "false"]),
});

const swapSchema = z.object({
  intent: z.literal("swap"),
  bannerIdA: z.string().uuid(),
  orderA: z.coerce.number().int(),
  bannerIdB: z.string().uuid(),
  orderB: z.coerce.number().int(),
});

const deleteSchema = z.object({
  intent: z.literal("delete"),
  bannerId: z.string().uuid(),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  const seller = await getSellerInfo(client);
  if (!seller) {
    return { ok: false, error: "판매자 정보를 찾을 수 없습니다" };
  }

  if (intent === "create") {
    const parsed = createSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }

    const existing = await getSellerBanners(client, seller.id);
    if (existing.length >= MAX_BANNERS) {
      return {
        ok: false,
        error: `배너는 최대 ${MAX_BANNERS}개까지 등록 가능합니다`,
      };
    }

    await createSellerBanner(client, {
      seller_id: seller.id,
      title: parsed.data.title,
      image_url: parsed.data.imageUrl,
      display_order: parsed.data.displayOrder,
    });

    return { ok: true };
  }

  if (intent === "update") {
    const parsed = updateSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }

    await updateSellerBanner(client, parsed.data.bannerId, {
      is_active: parsed.data.isActive === "true",
    });
    return { ok: true };
  }

  if (intent === "swap") {
    const parsed = swapSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }

    await swapBannerOrder(
      client,
      parsed.data.bannerIdA,
      parsed.data.orderA,
      parsed.data.bannerIdB,
      parsed.data.orderB
    );
    return { ok: true };
  }

  if (intent === "delete") {
    const parsed = deleteSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }

    await deleteSellerBannerRecord(client, parsed.data.bannerId);
    return { ok: true };
  }

  return { ok: false, error: "잘못된 요청입니다" };
};
