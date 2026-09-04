import { Star } from "lucide-react";
import { useSearchParams } from "react-router";
import Content from "~/common/components/content";
import Title from "~/common/components/title";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/common/components/ui/select";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/review-list-page";
import { makeSSRClient } from "~/supa-client";
import { getSellerReviews } from "../queries";
import { getSellerInfo } from "~/features/seller/queries";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const url = new URL(request.url);
  const rating = url.searchParams.get("rating") ?? "ALL";

  const seller = await getSellerInfo(client);
  if (!seller) {
    return { reviews: [], rating };
  }

  const reviews = await getSellerReviews(client, seller.id, { rating });
  return { reviews, rating };
};

export default function ReviewListPage({ loaderData }: Route.ComponentProps) {
  const { reviews, rating } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();

  const handleRatingChange = (nextRating: string) => {
    const next = new URLSearchParams(searchParams);
    if (nextRating === "ALL") {
      next.delete("rating");
    } else {
      next.set("rating", nextRating);
    }
    setSearchParams(next);
  };

  return (
    <Content>
      <Title title="리뷰 관리" />

      <div className="mb-3 flex justify-end">
        <Select value={rating} onValueChange={handleRatingChange}>
          <SelectTrigger className="w-32">
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
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead>작성일</TableHead>
            <TableHead>상품</TableHead>
            <TableHead>작성자</TableHead>
            <TableHead className="text-center">별점</TableHead>
            <TableHead>내용</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.length > 0 ? (
            reviews.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="py-3 whitespace-nowrap">
                  {item.created_at.slice(0, 10)}
                </TableCell>
                <TableCell className="py-3">
                  {item.product_name} ({item.product_code})
                </TableCell>
                <TableCell className="py-3">
                  {item.reviewer_nickname}
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center justify-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-4 w-4",
                          star <= item.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-none text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="max-w-[360px] py-3 whitespace-pre-wrap">
                  {item.content}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                조회된 리뷰가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Content>
  );
}
