import { ImageIcon, Loader } from "lucide-react";
import { useRef, useState } from "react";
import { useFetcher, useRevalidator } from "react-router";
import Card from "~/common/components/card";
import { Button } from "~/common/components/ui/button";
import { Input } from "~/common/components/ui/input";
import { Label } from "~/common/components/ui/label";
import { browserClient } from "~/supa-client";
import { uploadSellerBanner } from "../storage";

interface BannerUploadAreaProps {
  sellerCode: string;
  currentCount: number;
  maxBanners: number;
}

export default function BannerUploadArea({
  sellerCode,
  currentCount,
  maxBanners,
}: BannerUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetcher = useFetcher();
  const revalidator = useRevalidator();

  const canUpload = currentCount < maxBanners;

  const handleImageClick = () => {
    if (!canUpload) {
      alert(`배너는 최대 ${maxBanners}개까지 등록 가능합니다.`);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setSelectedFile(file);

    // 로컬 프리뷰 생성
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setTitle("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    if (!title.trim()) {
      alert("배너 제목을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Storage에 업로드
      const imageUrl = await uploadSellerBanner(
        browserClient,
        selectedFile,
        sellerCode
      );

      // 2. DB 레코드 생성
      const nextOrder = currentCount + 1;
      fetcher.submit(
        {
          intent: "create",
          title: title.trim(),
          imageUrl,
          displayOrder: String(nextOrder),
        },
        { method: "post", action: "/seller/banners/post" }
      );

      // 3. 초기화 + 새로고침
      handleReset();
      revalidator.revalidate();
    } catch (error) {
      console.error("배너 업로드 실패:", error);
      alert("배너 업로드에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">배너 등록</h2>
        <span className="text-sm text-muted-foreground">
          {currentCount}/{maxBanners}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        권장 비율: 7:3 (예: 1050x450px). 최대 {maxBanners}개까지 등록
        가능합니다.
      </p>

      {/* 이미지 선택 영역 */}
      <div
        className={`flex flex-col justify-center items-center bg-muted/50 border border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors aspect-7/3 overflow-hidden ${!canUpload && !previewUrl ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={handleImageClick}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="배너 미리보기"
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">
              {canUpload
                ? "클릭하여 배너 이미지를 선택하세요"
                : "최대 개수에 도달했습니다"}
            </span>
          </>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* 이미지 선택 후 제목 입력 + 등록 버튼 */}
      {selectedFile && (
        <div className="mt-4 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="banner-title">배너 제목</Label>
            <Input
              id="banner-title"
              placeholder="배너를 식별할 수 있는 제목을 입력하세요 (관리용)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  등록 중...
                </>
              ) : (
                "배너 등록"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              취소
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
