import { useEffect, useRef, useState } from "react";
import { Link, useFetcher, useNavigate } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import Card from "~/common/components/card";
import { Separator } from "~/common/components/ui/separator";
import { Label } from "~/common/components/ui/label";
import { Button } from "~/common/components/ui/button";
import { Textarea } from "~/common/components/ui/textarea";
import { useAlert } from "~/hooks/useAlert";
import { INQUIRY_CATEGORY_LABELS, INQUIRY_STATUS_LABELS } from "../constrants";
import type { Route } from "./+types/admin-inquiry-detail-page";
import { makeSSRClient } from "~/supa-client";
import { getAdminInquiryDetail } from "../queries";
import { answerAdminInquiry } from "../mutations";

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();
  const answer = formData.get("answer") as string;

  return await answerAdminInquiry(client, {
    inquiryId: params.inquiryId,
    answer,
  });
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const inquiry = await getAdminInquiryDetail(client, params.inquiryId);
  return { inquiry };
};

export default function AdminInquiryDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const { inquiry } = loaderData;
  const navigate = useNavigate();
  const { confirm, alert } = useAlert();
  const fetcher = useFetcher();
  const [answerText, setAnswerText] = useState(inquiry?.answer ?? "");

  const wasSubmittingRef = useRef(false);

  useEffect(() => {
    if (fetcher.state === "submitting") {
      wasSubmittingRef.current = true;
      return;
    }
    if (fetcher.state === "idle" && wasSubmittingRef.current) {
      wasSubmittingRef.current = false;
      if (fetcher.data?.success) {
        alert({
          title: "답변 등록 완료",
          message: "답변이 정상적으로 등록되었습니다.",
          primaryButton: {
            label: "확인",
            onClick: () => navigate("/system/inquiries"),
          },
        });
      }
    }
  }, [fetcher.state, fetcher.data, alert, navigate]);

  if (!inquiry) {
    return (
      <Content>
        <Title title="문의 상세" />
        <Card>
          <p className="text-sm text-muted-foreground">
            문의를 찾을 수 없습니다.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/system/inquiries">목록으로</Link>
          </Button>
        </Card>
      </Content>
    );
  }

  const isAnswered = inquiry.status === "answered";

  const handleSubmit = () => {
    if (!answerText.trim()) return;
    confirm({
      title: isAnswered ? "답변 수정" : "답변 등록",
      message: isAnswered
        ? "답변을 수정하시겠습니까?"
        : "이 문의에 답변을 등록하시겠습니까?",
      primaryButton: {
        label: isAnswered ? "수정" : "등록",
        onClick: () => {
          fetcher.submit({ answer: answerText }, { method: "post" });
        },
      },
      secondaryButton: { label: "취소", onClick: () => {} },
    });
  };

  return (
    <Content className="space-y-4">
      <Title title="문의 상세" />

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{inquiry.title}</h2>
          <span
            className={
              isAnswered
                ? "rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400"
                : "rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400"
            }
          >
            {INQUIRY_STATUS_LABELS[inquiry.status] ?? inquiry.status}
          </span>
        </div>
        <div className="mt-3">
          <InfoRow
            label="카테고리"
            value={
              INQUIRY_CATEGORY_LABELS[inquiry.category] ?? inquiry.category
            }
          />
          <Separator />
          <InfoRow label="작성자" value={inquiry.writer_nickname} />
          <Separator />
          <InfoRow label="접수일" value={inquiry.created_at.slice(0, 10)} />
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">문의 내용</h2>
        <div className="mt-2 whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">
          {inquiry.content}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">
          {isAnswered ? "답변 내용" : "답변 등록"}
        </h2>
        <Textarea
          className="mt-2"
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder="답변 내용을 입력하세요"
          rows={6}
        />
        {inquiry.answered_at && (
          <p className="mt-1 text-xs text-muted-foreground">
            답변일: {inquiry.answered_at.slice(0, 10)}
          </p>
        )}
        {fetcher.data?.error && (
          <p className="mt-2 text-sm text-red-500">{fetcher.data.error}</p>
        )}
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate("/system/inquiries")}>
          목록으로
        </Button>
        <Button disabled={!answerText.trim()} onClick={handleSubmit}>
          {isAnswered ? "답변 수정" : "답변 등록"}
        </Button>
      </div>
    </Content>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center py-2.5">
      <Label className="w-24 shrink-0 text-muted-foreground">{label}</Label>
      <span className="text-sm">{value}</span>
    </div>
  );
}
