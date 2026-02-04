import { Plus, Loader, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "~/common/components/ui/button";
import { Label } from "~/common/components/ui/label";
import { browserClient } from "~/supa-client";
import { uploadSellerLogo, deleteSellerLogo } from "../storage";

interface SellerLogoUploadProps {
  sellerCode: string;
  logoUrl: string;
}

export default function SellerLogoUpload({
  sellerCode,
  logoUrl,
}: SellerLogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState(false);

  // cache-busting을 위한 timestamp
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const displayUrl = currentUrl
    ? `${currentUrl}?t=${cacheBuster}`
    : `${logoUrl}?t=${cacheBuster}`;

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    try {
      const url = await uploadSellerLogo(browserClient, file, sellerCode);
      setCurrentUrl(url);
      setHasImage(true);
      setCacheBuster(Date.now());
    } catch (error) {
      console.error("로고 업로드 실패:", error);
      alert("로고 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      // input 초기화 (같은 파일 재선택 가능하도록)
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    try {
      await deleteSellerLogo(browserClient, sellerCode);
      setCurrentUrl(null);
      setHasImage(false);
    } catch (error) {
      console.error("로고 삭제 실패:", error);
      alert("로고 삭제에 실패했습니다.");
    }
  };

  const handleImageError = () => {
    setHasImage(false);
  };

  const handleImageLoad = () => {
    setHasImage(true);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>대표 이미지 (로고)</Label>
      <div className="flex gap-2">
        {!hasImage ? (
          <div
            className="flex justify-center items-center w-30 h-30 bg-gray-100 border border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={handleClick}
          >
            {isUploading ? (
              <Loader className="w-6 h-6 text-gray-400 animate-spin" />
            ) : (
              <Plus className="w-6 h-6 text-gray-400" />
            )}
          </div>
        ) : (
          <div className="relative w-30 h-30 group overflow-hidden">
            <img
              src={displayUrl}
              alt="판매자 로고"
              className="w-full h-full object-contain rounded border border-gray-200"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            <Button
              type="button"
              size="icon"
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 hover:bg-white border border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={handleRemove}
            >
              <X className="w-4 h-4 text-black" />
            </Button>
          </div>
        )}
        {/* 이미지 존재 여부 확인용 hidden img */}
        {!hasImage && !currentUrl && (
          <img
            src={displayUrl}
            alt=""
            className="hidden"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleChange}
      />
    </div>
  );
}
