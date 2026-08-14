import { useState } from "react";
import { useFetcher } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import Card from "~/common/components/card";
import { useAlert } from "~/hooks/useAlert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";
import { Button } from "~/common/components/ui/button";
import { Textarea } from "~/common/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/common/components/ui/dialog";
import { cn } from "~/lib/utils";
import { RETURN_REASON_LABELS } from "../constrants";
import type { Route } from "./+types/return-list-page";
import { makeSSRClient } from "~/supa-client";
import { getSellerReturnRequests, type ReturnRequestItem } from "../queries";
import {
  approveReturnStage1,
  rejectReturn,
  confirmReturnReceived,
  finalizeReturnApproval,
} from "../mutations";
import { getSellerInfo } from "~/features/seller/queries";

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const deliveryItemId = formData.get("deliveryItemId") as string;

  const seller = await getSellerInfo(client);
  if (!seller) {
    return { success: false, error: "판매자 정보를 찾을 수 없습니다." };
  }

  switch (intent) {
    case "approveStage1":
      return await approveReturnStage1(client, { deliveryItemId, sellerId: seller.id });
    case "reject":
      return await rejectReturn(client, {
        deliveryItemId,
        sellerId: seller.id,
        reason: formData.get("reason") as string,
      });
    case "confirmReceived":
      return await confirmReturnReceived(client, { deliveryItemId, sellerId: seller.id });
    case "finalizeApproval":
      return await finalizeReturnApproval(client, { deliveryItemId, sellerId: seller.id });
    default:
      return { success: false, error: "알 수 없는 요청입니다." };
  }
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const seller = await getSellerInfo(client);
  if (!seller) {
    return { returns: [] };
  }

  const returns = await getSellerReturnRequests(client, seller.id);
  return { returns };
};

type Stage = {
  label: string;
  className: string;
};

const getStage = (item: ReturnRequestItem): Stage => {
  if (item.reject_reason) {
    return {
      label: "거절됨",
      className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
    };
  }
  if (item.return_received_at) {
    return {
      label: "회수확인 완료 (검수 대기)",
      className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    };
  }
  if (item.return_approved_at) {
    return {
      label: "1차 승인됨 (회수 대기)",
      className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    };
  }
  return {
    label: "승인 대기",
    className: "bg-muted text-muted-foreground",
  };
};

export default function ReturnListPage({ loaderData }: Route.ComponentProps) {
  const { returns } = loaderData;
  const { confirm } = useAlert();
  const fetcher = useFetcher();

  const submitAction = (intent: string, deliveryItemId: string) => {
    fetcher.submit({ intent, deliveryItemId }, { method: "post" });
  };

  const handleConfirmAction = (
    intent: string,
    deliveryItemId: string,
    title: string,
    message: string
  ) => {
    confirm({
      title,
      message,
      primaryButton: {
        label: title,
        onClick: () => submitAction(intent, deliveryItemId),
      },
      secondaryButton: { label: "취소", onClick: () => {} },
    });
  };

  return (
    <Content>
      <Title title="반품 관리" />

      <Card>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>신청일</TableHead>
              <TableHead>주문번호</TableHead>
              <TableHead>상품정보</TableHead>
              <TableHead>사유</TableHead>
              <TableHead>수령인</TableHead>
              <TableHead className="text-center">진행상태</TableHead>
              <TableHead className="text-center">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returns.length > 0 ? (
              returns.map((item) => {
                const stage = getStage(item);
                const canResumeToFinal = !!item.return_received_at;

                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.updated_at.slice(0, 10)}</TableCell>
                    <TableCell>{item.order_number}</TableCell>
                    <TableCell>
                      {item.product_name} ({item.sku_code}) x {item.quantity}
                    </TableCell>
                    <TableCell>
                      {item.reason ? RETURN_REASON_LABELS[item.reason] ?? item.reason : "-"}
                    </TableCell>
                    <TableCell>
                      <div>{item.recipient_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.recipient_phone}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2 py-1 text-xs font-medium",
                          stage.className
                        )}
                      >
                        {stage.label}
                      </span>
                      {item.reject_reason && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          ({item.reject_reason})
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap justify-center gap-2">
                        {item.reject_reason ? (
                          canResumeToFinal ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                handleConfirmAction(
                                  "finalizeApproval",
                                  item.id,
                                  "최종 승인",
                                  "거절을 취소하고 최종 승인하시겠습니까? 이 순간 환불이 자동 처리됩니다."
                                )
                              }
                            >
                              최종 승인 (재진행)
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                handleConfirmAction(
                                  "approveStage1",
                                  item.id,
                                  "1차 승인",
                                  "거절을 취소하고 1차 승인하시겠습니까?"
                                )
                              }
                            >
                              1차 승인 (재진행)
                            </Button>
                          )
                        ) : item.return_received_at ? (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              handleConfirmAction(
                                "finalizeApproval",
                                item.id,
                                "최종 승인",
                                "최종 승인하시겠습니까? 이 순간 환불이 자동 처리됩니다."
                              )
                            }
                          >
                            최종 승인
                          </Button>
                        ) : item.return_approved_at ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleConfirmAction(
                                "confirmReceived",
                                item.id,
                                "회수 확인",
                                "반송 물품을 회수 확인하시겠습니까?"
                              )
                            }
                          >
                            회수 확인
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              handleConfirmAction(
                                "approveStage1",
                                item.id,
                                "1차 승인",
                                "이 반품 신청을 1차 승인하시겠습니까?"
                              )
                            }
                          >
                            1차 승인
                          </Button>
                        )}
                        <RejectDialog
                          deliveryItemId={item.id}
                          isEditing={!!item.reject_reason}
                          onReject={(deliveryItemId, reason) => {
                            fetcher.submit(
                              { intent: "reject", deliveryItemId, reason },
                              { method: "post" }
                            );
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  대기 중인 반품 신청이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {fetcher.data?.error && (
        <p className="mt-2 text-sm text-red-500">{fetcher.data.error}</p>
      )}
    </Content>
  );
}

function RejectDialog({
  deliveryItemId,
  isEditing,
  onReject,
}: {
  deliveryItemId: string;
  isEditing: boolean;
  onReject: (deliveryItemId: string, reason: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onReject(deliveryItemId, reason.trim());
    setOpen(false);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          {isEditing ? "거절 사유 수정" : "거절"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>반품 거절</DialogTitle>
          <DialogDescription>
            거절 사유를 입력해주세요. 상태는 변경되지 않고 사유만 기록됩니다.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="거절 사유를 입력하세요"
          rows={4}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!reason.trim()}
            onClick={handleSubmit}
          >
            거절
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
