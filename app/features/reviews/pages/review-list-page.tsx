import { useState } from "react";
import { Star } from "lucide-react";
import { useFetcher, useSearchParams } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import Card from "~/common/components/card";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Textarea } from "~/common/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/common/components/ui/select";
import { useAlert } from "~/hooks/useAlert";
import { cn } from "~/lib/utils";
import { formatNumber } from "~/common/utils/format";
import type { Route } from "./+types/review-list-page";
import { makeSSRClient } from "~/supa-client";
import {
  getSellerReviews,
  getSellerReviewStats,
  type ReviewListItem,
} from "../queries";
import { replyToReview, deleteReviewReply } from "../mutations";
import { getSellerInfo } from "~/features/seller/queries";

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const reviewId = formData.get("reviewId") as string;

  const seller = await getSellerInfo(client);
  if (!seller) {
    return { success: false, error: "판매자 정보를 찾을 수 없습니다." };
  }

  if (intent === "reply") {
    return await replyToReview(client, {
      reviewId,
      sellerId: seller.id,
      reply: formData.get("reply") as string,
    });
  }
  if (intent === "deleteReply") {
    return await deleteReviewReply(client, { reviewId, sellerId: seller.id });
  }
  return { success: false, error: "알 수 없는 요청입니다." };
};

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

// 기본 기간: 오늘 ~ 한 달 전. 쿼리스트링에 값이 있으면 그걸 우선한다
const getDefaultPeriod = () => {
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  return {
    periodStart: toDateInputValue(oneMonthAgo),
    periodEnd: toDateInputValue(today),
  };
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const url = new URL(request.url);
  const defaultPeriod = getDefaultPeriod();
  const rating = url.searchParams.get("rating") ?? "ALL";
  const answered = url.searchParams.get("answered") ?? "ALL";
  const periodStart =
    url.searchParams.get("periodStart") ?? defaultPeriod.periodStart;
  const periodEnd =
    url.searchParams.get("periodEnd") ?? defaultPeriod.periodEnd;

  const seller = await getSellerInfo(client);
  if (!seller) {
    return {
      reviews: [],
      stats: {
        totalCount: 0,
        averageRating: 0,
        unansweredCount: 0,
        ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
      rating,
      answered,
      periodStart,
      periodEnd,
    };
  }

  const [reviews, stats] = await Promise.all([
    getSellerReviews(client, seller.id, {
      rating,
      answered,
      periodStart: periodStart || undefined,
      periodEnd: periodEnd || undefined,
    }),
    getSellerReviewStats(client, seller.id),
  ]);

  return { reviews, stats, rating, answered, periodStart, periodEnd };
};

export default function ReviewListPage({ loaderData }: Route.ComponentProps) {
  const { reviews, stats, rating, answered, periodStart, periodEnd } =
    loaderData;
  const [searchParams, setSearchParams] = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === "ALL") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  return (
    <Content>
      <Title title="리뷰 관리" />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Card>
          <p className="text-sm text-muted-foreground">전체 별점</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {stats.averageRating.toFixed(1)}
            </span>
            <StarRow rating={Math.round(stats.averageRating)} />
            <span className="text-sm text-muted-foreground">
              (총 {formatNumber(stats.totalCount)}개)
            </span>
          </div>
          <div className="mt-2 space-y-1">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const count = stats.ratingCounts[star];
              const percent =
                stats.totalCount > 0 ? (count / stats.totalCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-6 text-muted-foreground">{star}점</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-muted-foreground">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">미답변 리뷰</p>
          <p className="mt-1 text-2xl font-bold">
            {formatNumber(stats.unansweredCount)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            답변을 기다리는 리뷰 수
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">낮은 별점 리뷰</p>
          <p className="mt-1 text-2xl font-bold">
            {formatNumber(stats.ratingCounts[1] + stats.ratingCounts[2])}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">1~2점 리뷰 수</p>
        </Card>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Select value={answered} onValueChange={(v) => updateParam("answered", v)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            <SelectItem value="unanswered">미답변</SelectItem>
            <SelectItem value="answered">답변완료</SelectItem>
          </SelectContent>
        </Select>
        <Select value={rating} onValueChange={(v) => updateParam("rating", v)}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 별점</SelectItem>
            {[5, 4, 3, 2, 1].map((value) => (
              <SelectItem key={value} value={String(value)}>
                {value}점
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          className="w-36"
          value={periodStart}
          onChange={(e) => updateParam("periodStart", e.target.value)}
        />
        <span className="text-sm text-muted-foreground">~</span>
        <Input
          type="date"
          className="w-36"
          value={periodEnd}
          onChange={(e) => updateParam("periodEnd", e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <Card>
            <p className="py-8 text-center text-sm text-muted-foreground">
              조회된 리뷰가 없습니다.
            </p>
          </Card>
        )}
      </div>
    </Content>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-none text-muted-foreground"
          )}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewListItem }) {
  const { confirm } = useAlert();
  const fetcher = useFetcher();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState(review.seller_reply ?? "");

  const isAnswered = !!review.seller_replied_at;

  const submitReply = () => {
    if (!replyText.trim()) return;
    fetcher.submit(
      { intent: "reply", reviewId: review.id, reply: replyText },
      { method: "post" }
    );
    setIsReplying(false);
  };

  const handleDelete = () => {
    confirm({
      title: "답변 삭제",
      message: "등록된 답변을 삭제하시겠습니까?",
      primaryButton: {
        label: "삭제",
        onClick: () => {
          fetcher.submit(
            { intent: "deleteReply", reviewId: review.id },
            { method: "post" }
          );
        },
      },
      secondaryButton: { label: "취소", onClick: () => {} },
    });
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{review.reviewer_nickname}</span>
            <span className="text-xs text-muted-foreground">
              {review.created_at.slice(0, 10)}
            </span>
          </div>
          <StarRow rating={review.rating} />
        </div>
        <span className="text-xs text-muted-foreground">
          {review.product_name} ({review.product_code})
        </span>
      </div>

      <p className="mt-2 whitespace-pre-wrap text-sm">{review.content}</p>

      {review.images.length > 0 && (
        <div className="mt-2 flex gap-2">
          {review.images.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`리뷰 이미지 ${index + 1}`}
              className="h-16 w-16 rounded-md object-cover"
            />
          ))}
        </div>
      )}

      {isAnswered && !isReplying && (
        <div className="mt-3 rounded-md bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              판매자 답변 · {review.seller_replied_at?.slice(0, 10)}
            </p>
            <div className="flex gap-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setIsReplying(true)}
              >
                수정
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
              >
                삭제
              </Button>
            </div>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm">
            {review.seller_reply}
          </p>
        </div>
      )}

      {isReplying && (
        <div className="mt-3">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="답변을 입력하세요"
            rows={3}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setIsReplying(false);
                setReplyText(review.seller_reply ?? "");
              }}
            >
              취소
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!replyText.trim()}
              onClick={submitReply}
            >
              {isAnswered ? "답변 수정" : "답변 등록"}
            </Button>
          </div>
        </div>
      )}

      {!isAnswered && !isReplying && (
        <div className="mt-3 flex justify-end">
          <Button type="button" size="sm" onClick={() => setIsReplying(true)}>
            답변 쓰기
          </Button>
        </div>
      )}

      {fetcher.data?.error && (
        <p className="mt-2 text-sm text-red-500">{fetcher.data.error}</p>
      )}
    </Card>
  );
}
