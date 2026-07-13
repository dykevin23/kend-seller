import { z } from "zod";
import type { Route } from "./+types/post-seller-approval-page";
import { makeSSRClient } from "~/supa-client";
import { approveSeller, rejectSeller } from "../mutations";

const approveSchema = z.object({
  intent: z.literal("approve"),
  sellerId: z.string().uuid(),
});

const rejectSchema = z.object({
  intent: z.literal("reject"),
  sellerId: z.string().uuid(),
  reason: z.string().min(1, "반려 사유를 입력해주세요"),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "approve") {
    const parsed = approveSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }

    await approveSeller(client, parsed.data.sellerId);
    return { ok: true };
  }

  if (intent === "reject") {
    const parsed = rejectSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }

    await rejectSeller(client, parsed.data.sellerId, parsed.data.reason);
    return { ok: true };
  }

  return { ok: false, error: "잘못된 요청입니다" };
};
