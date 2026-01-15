import Card from "~/common/components/card";
import { Label } from "~/common/components/ui/label";
import { Plus, X, Loader } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "~/common/components/ui/button";
import { browserClient } from "~/supa-client";
import { uploadProductImage, getFileExtension, deleteProductImage } from "../storage";

interface ProductDescriptionCardProps {
  storageFolder: string;
  images: DescriptionImage[];
  setImages: (images: DescriptionImage[]) => void;
}

export interface DescriptionImage {
  url: string;
  fileName: string;
}

export default function ProductDescriptionCard({
  storageFolder,
  images,
  setImages,
}: ProductDescriptionCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleChangeImages = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadedImages: DescriptionImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = getFileExtension(file);
        const currentIndex = images.length + i;
        const fileName = `description_${currentIndex + 1}.${ext}`;

        const url = await uploadProductImage(
          browserClient,
          file,
          storageFolder,
          "descriptions",
          fileName
        );

        uploadedImages.push({ url, fileName });
      }

      setImages([...images, ...uploadedImages]);
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = images[index];
    if (imageToRemove) {
      try {
        // Storage에서 삭제
        await deleteProductImage(
          browserClient,
          storageFolder,
          "descriptions",
          imageToRemove.fileName
        );
        setImages(images.filter((_, i) => i !== index));
      } catch (error) {
        console.error("이미지 삭제 실패:", error);
        alert("이미지 삭제에 실패했습니다.");
      }
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold">상세설명</h2>
      <div className="flex flex-col gap-2 pt-4">
        <Label>상세설명 이미지</Label>
        <div className="flex flex-col gap-2">
          <div
            className="flex justify-center items-center w-full h-32 bg-gray-100 border border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={handleAddImage}
          >
            {isUploading ? (
              <Loader className="w-6 h-6 text-gray-400 animate-spin" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Plus className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-500">
                  이미지를 추가하세요
                </span>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            multiple
            onChange={handleChangeImages}
            name="description_images"
          />
        </div>

        {images.length > 0 && (
          <div className="flex flex-col gap-2 mt-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative w-full h-64 group border border-gray-200 rounded overflow-hidden"
              >
                <img
                  src={image.url}
                  alt={`상세설명 이미지 ${index + 1}`}
                  className="w-full h-full object-contain bg-gray-50"
                />
                <Button
                  type="button"
                  size="icon"
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="w-5 h-5 text-black" />
                </Button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
