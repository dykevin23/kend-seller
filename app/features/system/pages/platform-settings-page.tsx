import { Form, useNavigation } from "react-router";
import { z } from "zod";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import Card from "~/common/components/card";
import TextField from "~/common/components/text-field";
import { Button } from "~/common/components/ui/button";
import { makeSSRClient } from "~/supa-client";
import { getPlatformSettings } from "../queries";
import { updatePlatformSettings } from "../mutations";
import type { Route } from "./+types/platform-settings-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const settings = await getPlatformSettings(client);
  return { settings };
};

const formSchema = z.object({
  freeShippingThreshold: z.coerce
    .number()
    .int("정수만 입력 가능합니다")
    .min(0, "0 이상의 값을 입력해주세요"),
  commissionRate: z.coerce
    .number()
    .int("정수만 입력 가능합니다")
    .min(0, "0 이상의 값을 입력해주세요")
    .max(100, "100 이하의 값을 입력해주세요"),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!success) {
    return { success: false, formErrors: error.flatten().fieldErrors };
  }

  const { client } = makeSSRClient(request);
  await updatePlatformSettings(client, {
    freeShippingThreshold: data.freeShippingThreshold,
    commissionRate: data.commissionRate,
  });

  return { success: true };
};

export default function PlatformSettingsPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { settings } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Content>
      <Title title="플랫폼 설정" />
      <Form className="space-y-5" method="post">
        <Card>
          <TextField
            id="freeShippingThreshold"
            name="freeShippingThreshold"
            type="number"
            min={0}
            step={1}
            label="플랫폼 무료배송 기준금액"
            direction="row"
            className="w-1/2"
            defaultValue={settings.free_shipping_threshold}
            outsideAdornment={<span className="text-sm text-muted-foreground">원</span>}
          />
          <p className="px-4 text-xs text-muted-foreground">
            장바구니 총액이 이 금액 이상이면 판매자 배송비 정책과 무관하게
            플랫폼이 배송비를 부담합니다. 0으로 설정하면 이 기능이 꺼집니다.
          </p>
          {actionData?.formErrors?.freeShippingThreshold && (
            <p className="px-4 text-sm text-red-500">
              {actionData.formErrors.freeShippingThreshold[0]}
            </p>
          )}
        </Card>
        <Card>
          <TextField
            id="commissionRate"
            name="commissionRate"
            type="number"
            min={0}
            max={100}
            step={1}
            label="정산 수수료율"
            direction="row"
            className="w-1/2"
            defaultValue={settings.commission_rate}
            outsideAdornment={<span className="text-sm text-muted-foreground">%</span>}
          />
          <p className="px-4 text-xs text-muted-foreground">
            정산 계산 배치가 판매자 매출에서 이 비율만큼 수수료로 차감합니다.
            매월 계산 시점의 값이 각 정산 내역에 스냅샷으로 기록되므로, 변경해도
            과거 정산 내역에는 영향을 주지 않습니다.
          </p>
          {actionData?.formErrors?.commissionRate && (
            <p className="px-4 text-sm text-red-500">
              {actionData.formErrors.commissionRate[0]}
            </p>
          )}
        </Card>
        <div className="flex items-center justify-end gap-2">
          {actionData?.success && (
            <span className="text-sm text-muted-foreground">
              저장되었습니다.
            </span>
          )}
          <Button type="submit" disabled={isSubmitting}>
            저장
          </Button>
        </div>
      </Form>
    </Content>
  );
}
