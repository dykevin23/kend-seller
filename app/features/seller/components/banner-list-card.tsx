import { ArrowUp, ArrowDown, X } from "lucide-react";
import { useFetcher, useRevalidator } from "react-router";
import Card from "~/common/components/card";
import { Button } from "~/common/components/ui/button";
import { Checkbox } from "~/common/components/ui/checkbox";
import { browserClient } from "~/supa-client";
import { deleteSellerBanner } from "../storage";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface BannerListCardProps {
  banners: Banner[];
}

export default function BannerListCard({ banners }: BannerListCardProps) {
  const fetcher = useFetcher();
  const revalidator = useRevalidator();

  if (banners.length === 0) {
    return (
      <Card>
        <h2 className="text-lg font-bold mb-2">등록된 배너</h2>
        <p className="text-sm text-muted-foreground">
          등록된 배너가 없습니다.
        </p>
      </Card>
    );
  }

  const handleSwap = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const current = banners[index];
    const target = banners[targetIndex];

    fetcher.submit(
      {
        intent: "swap",
        bannerIdA: current.id,
        orderA: String(current.display_order),
        bannerIdB: target.id,
        orderB: String(target.display_order),
      },
      { method: "post", action: "/seller/banners/post" }
    );
    revalidator.revalidate();
  };

  const handleToggleActive = (bannerId: string, currentActive: boolean) => {
    fetcher.submit(
      {
        intent: "update",
        bannerId,
        isActive: String(!currentActive),
      },
      { method: "post", action: "/seller/banners/post" }
    );
    revalidator.revalidate();
  };

  const handleDelete = async (bannerId: string, imageUrl: string) => {
    if (!confirm("배너를 삭제하시겠습니까?")) return;

    try {
      await deleteSellerBanner(browserClient, imageUrl);

      fetcher.submit(
        {
          intent: "delete",
          bannerId,
        },
        { method: "post", action: "/seller/banners/post" }
      );

      revalidator.revalidate();
    } catch (error) {
      console.error("배너 삭제 실패:", error);
      alert("배너 삭제에 실패했습니다.");
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-bold mb-4">등록된 배너</h2>
      <div className="flex flex-col gap-4">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className="flex items-center gap-4 p-3 border rounded-lg"
          >
            {/* 순서 변경 버튼 */}
            <div className="flex flex-col gap-1 shrink-0">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                disabled={index === 0}
                onClick={() => handleSwap(index, "up")}
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                disabled={index === banners.length - 1}
                onClick={() => handleSwap(index, "down")}
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
            </div>

            {/* 배너 이미지 프리뷰 */}
            <div className="w-48 shrink-0 aspect-7/3 overflow-hidden rounded border">
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* 제목 + 순서 정보 */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{banner.title}</p>
              <p className="text-sm text-muted-foreground">
                순서 {banner.display_order}
              </p>
            </div>

            {/* 활성 토글 */}
            <div className="flex items-center gap-2 shrink-0">
              <Checkbox
                checked={banner.is_active}
                onCheckedChange={() =>
                  handleToggleActive(banner.id, banner.is_active)
                }
              />
              <span className="text-sm">
                {banner.is_active ? "활성" : "비활성"}
              </span>
            </div>

            {/* 삭제 버튼 */}
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="shrink-0"
              onClick={() => handleDelete(banner.id, banner.image_url)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
