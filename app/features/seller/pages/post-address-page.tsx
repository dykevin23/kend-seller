import { z } from "zod";
import type { Route } from "./+types/post-address-page";

const formSchema = z.object({
  addressName: z.string().min(1),
  zoneCode: z.string().max(6),
  address: z.string(),
  addressDetail: z.string(),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );

  return { ok: true };
};
