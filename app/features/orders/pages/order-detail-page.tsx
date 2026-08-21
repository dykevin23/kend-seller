import { useState } from "react";
import { Link, useFetcher, useNavigate } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import Card from "~/common/components/card";
import { Separator } from "~/common/components/ui/separator";
import { Label } from "~/common/components/ui/label";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/common/components/ui/select";
import { useAlert } from "~/hooks/useAlert";
import { formatNumber } from "~/common/utils/format";
import {
  ORDER_STATUS,
  ORDER_STATUS_ACTIONS,
  DELIVERY_STATUS_LABELS,
  isValidTrackingNumber,
  normalizeTrackingNumber,
} from "../constrants";
import { COURIER_COMPANIES } from "~/features/products/constrants";
import type { Route } from "./+types/order-detail-page";
import { makeSSRClient } from "~/supa-client";
import { getSellerOrderDetail } from "../queries";
import { updateOrderStatus, markOrderShipped } from "../mutations";
import { getSellerInfo } from "~/features/seller/queries";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["cancelled"],
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

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

  if (intent === "ship") {
    const courier = formData.get("courier") as string;
    const trackingNumber = formData.get("trackingNumber") as string;

    if (!courier || !trackingNumber) {
      return { success: false, error: "배송사와 송장번호를 모두 입력해주세요." };
    }
    if (!isValidTrackingNumber(trackingNumber)) {
      return {
        success: false,
        error: "송장번호 형식이 올바르지 않습니다. 숫자 8~20자리로 입력해주세요.",
      };
    }

    return await markOrderShipped(client, {
      orderId: order.id,
      sellerId: seller.id,
      courier,
      trackingNumber: normalizeTrackingNumber(trackingNumber),
    });
  }

  const status = formData.get("status") as string;
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
  const shipFetcher = useFetcher();
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingError, setTrackingError] = useState("");

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

  // 스마트택배 sync-tracking 크론은 조회 실패(104/106) 시 tracking_synced_at을 갱신하지 않고
  // 넘어가므로, 발송 후 일정 시간이 지나도 이 값이 비어있으면 송장번호 오입력 가능성이 있다
  const TRACKING_SYNC_ALERT_HOURS = 24;
  const showTrackingSyncAlert =
    order.delivery?.status === "shipped" &&
    !order.delivery.tracking_synced_at &&
    !!order.delivery.shipped_at &&
    Date.now() - new Date(order.delivery.shipped_at).getTime() >
      TRACKING_SYNC_ALERT_HOURS * 60 * 60 * 1000;

  const handleShip = () => {
    if (!courier || !trackingNumber) return;
    if (!isValidTrackingNumber(trackingNumber)) {
      setTrackingError("송장번호는 숫자 8~20자리로 입력해주세요.");
      return;
    }
    setTrackingError("");
    confirm({
      title: "배송 처리",
      message: `배송사 "${COURIER_COMPANIES.find((c) => c.value === courier)?.label}", 송장번호 "${trackingNumber}"로 배송 처리하시겠습니까?`,
      primaryButton: {
        label: "배송 처리",
        onClick: () => {
          shipFetcher.submit(
            { intent: "ship", courier, trackingNumber },
            { method: "post" }
          );
        },
      },
      secondaryButton: { label: "취소", onClick: () => {} },
    });
  };

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

      {order.status === "preparing" && (
        <Card>
          <h2 className="text-xl font-bold">배송 처리</h2>
          <div className="flex items-end gap-2 mt-3">
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">배송사</Label>
              <Select value={courier} onValueChange={setCourier}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="배송사 선택" />
                </SelectTrigger>
                <SelectContent>
                  {COURIER_COMPANIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <Label className="text-xs text-muted-foreground">송장번호</Label>
              <Input
                value={trackingNumber}
                onChange={(e) => {
                  setTrackingNumber(e.target.value);
                  if (trackingError) setTrackingError("");
                }}
                placeholder="송장번호 입력 (숫자 8~20자리)"
              />
            </div>
            <Button
              onClick={handleShip}
              disabled={!courier || !trackingNumber}
            >
              배송 처리
            </Button>
          </div>
          {trackingError && (
            <p className="text-sm text-red-500 mt-2">{trackingError}</p>
          )}
          {shipFetcher.data?.error && (
            <p className="text-sm text-red-500 mt-2">
              {shipFetcher.data.error}
            </p>
          )}
        </Card>
      )}

      {order.delivery && (
        <Card>
          <h2 className="text-xl font-bold">배송 정보</h2>
          {showTrackingSyncAlert && (
            <p className="mb-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              발송 후 {TRACKING_SYNC_ALERT_HOURS}시간이 지나도 배송 조회가 확인되지
              않고 있습니다. 송장번호를 다시 확인해주세요.
            </p>
          )}
          <InfoRow
            label="배송사"
            value={
              COURIER_COMPANIES.find((c) => c.value === order.delivery!.courier)
                ?.label ??
              order.delivery.courier ??
              "-"
            }
          />
          <Separator />
          <InfoRow
            label="송장번호"
            value={order.delivery.tracking_number ?? "-"}
          />
          <Separator />
          <InfoRow
            label="배송상태"
            value={
              DELIVERY_STATUS_LABELS[order.delivery.status] ??
              order.delivery.status
            }
          />
          {order.delivery.tracking_synced_at && (
            <>
              <Separator />
              <InfoRow
                label="마지막 확인"
                value={new Date(order.delivery.tracking_synced_at).toLocaleString(
                  "ko-KR"
                )}
              />
            </>
          )}
        </Card>
      )}

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
