import { Link, useFetcher, useNavigate } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import Card from "~/common/components/card";
import { Separator } from "~/common/components/ui/separator";
import { Label } from "~/common/components/ui/label";
import { Button } from "~/common/components/ui/button";
import { useAlert } from "~/hooks/useAlert";
import { formatNumber } from "~/common/utils/format";
import { ORDER_STATUS, ORDER_STATUS_ACTIONS } from "../constrants";
import type { Route } from "./+types/order-detail-page";
import { makeSSRClient } from "~/supa-client";
import { getSellerOrderDetail } from "../queries";
import { updateOrderStatus } from "../mutations";
import { getSellerInfo } from "~/features/seller/queries";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["cancelled"],
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();
  const status = formData.get("status") as string;

  const seller = await getSellerInfo(client);
  if (!seller) {
    return { success: false, error: "판매자 정보를 찾을 수 없습니다." };
  }

  const order = await getSellerOrderDetail(client, {
    sellerId: seller.id,
    orderNumber: params.orderNumber,
  });
  if (!order) {
    return { success: false, error: "주문을 찾을 수 없습니다." };
  }

  const result = await updateOrderStatus(client, {
    orderIds: [order.id],
    sellerId: seller.id,
    status,
  });

  if (result.updatedCount === 0) {
    return { success: false, error: "현재 상태에서는 변경할 수 없습니다." };
  }

  return { success: true };
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const seller = await getSellerInfo(client);
  if (!seller) {
    return { order: null };
  }

  const order = await getSellerOrderDetail(client, {
    sellerId: seller.id,
    orderNumber: params.orderNumber,
  });

  return { order };
};

export default function OrderDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const { order } = loaderData;
  const navigate = useNavigate();
  const { confirm } = useAlert();
  const fetcher = useFetcher();

  if (!order) {
    return (
      <Content>
        <Title title="주문 상세" />
        <Card>
          <p className="text-sm text-muted-foreground">
            주문을 찾을 수 없습니다.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/orders/list">목록으로</Link>
          </Button>
        </Card>
      </Content>
    );
  }

  const getStatusLabel = (status: string) =>
    ORDER_STATUS.find((s) => s.value === status)?.label ?? status;

  const nextActions = ORDER_STATUS_ACTIONS.filter((action) =>
    ALLOWED_TRANSITIONS[order.status]?.includes(action.value)
  );

  const handleStatusChange = (status: string, label: string) => {
    confirm({
      title: "주문 상태 변경",
      message: `이 주문을 "${label}" 상태로 변경하시겠습니까?`,
      primaryButton: {
        label: "변경",
        onClick: () => {
          fetcher.submit({ status }, { method: "post" });
        },
      },
      secondaryButton: { label: "취소", onClick: () => {} },
    });
  };

  return (
    <Content className="space-y-4">
      <Title title={`주문 상세 — ${order.order_number}`} />

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">주문 상태</h2>
          <span className="text-sm font-medium">
            {getStatusLabel(order.status)}
          </span>
        </div>
        {nextActions.length > 0 && (
          <div className="flex gap-2 mt-3">
            {nextActions.map((action) => (
              <Button
                key={action.value}
                type="button"
                size="sm"
                variant={action.value === "cancelled" ? "outline" : "default"}
                onClick={() => handleStatusChange(action.value, action.label)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-bold">수령인 정보</h2>
        <InfoRow label="수령인" value={order.order_group.recipient_name} />
        <Separator />
        <InfoRow label="연락처" value={order.order_group.recipient_phone} />
        <Separator />
        <InfoRow
          label="배송지"
          value={`(${order.order_group.zone_code}) ${order.order_group.address} ${order.order_group.address_detail ?? ""}`}
        />
        {order.order_group.delivery_message && (
          <>
            <Separator />
            <InfoRow
              label="배송 메시지"
              value={order.order_group.delivery_message}
            />
          </>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-bold">상품 목록</h2>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm"
            >
              <span>
                {item.product_name} ({item.sku_code}) x {item.quantity}
              </span>
              <span>{formatNumber(item.subtotal)}원</span>
            </div>
          ))}
        </div>
        <Separator className="my-2" />
        <div className="flex items-center justify-between text-sm font-medium">
          <span>상품금액</span>
          <span>{formatNumber(order.product_amount)}원</span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>배송비</span>
          <span>{formatNumber(order.shipping_fee)}원</span>
        </div>
        <div className="flex items-center justify-between text-base font-bold mt-1">
          <span>합계</span>
          <span>{formatNumber(order.total_amount)}원</span>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">결제 정보</h2>
        <InfoRow
          label="결제수단"
          value={order.order_group.payment_method ?? "-"}
        />
        <Separator />
        <InfoRow
          label="결제상태"
          value={order.order_group.payment?.status ?? "-"}
        />
      </Card>

      <div>
        <Button variant="outline" onClick={() => navigate("/orders/list")}>
          목록으로
        </Button>
      </div>
    </Content>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center">
      <Label className="w-32 shrink-0 text-muted-foreground">{label}</Label>
      <span className="text-sm">{value}</span>
    </div>
  );
}
