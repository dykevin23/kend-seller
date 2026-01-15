import Card from "~/common/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/common/components/ui/tabs";
import type { ProductOptionArrayProps } from "./product-option-card";
import { Label } from "~/common/components/ui/label";
import { Plus, X, Loader } from "lucide-react";
import { useRef, useState } from "react";
import DataGrid from "~/common/components/data-grid";
import { Button } from "~/common/components/ui/button";
import { browserClient } from "~/supa-client";
import { uploadProductImage, getFileExtension } from "../storage";

interface ProductImageCardProps {
  options: ProductOptionArrayProps[];
  storageFolder: string;
  mainImage: ProductImage | undefined;
  setMainImage: (image: ProductImage | undefined) => void;
  additionalImages: ProductImage[];
  setAdditionalImages: (images: ProductImage[]) => void;
}

export interface ProductImage {
  url: string;
  fileName: string;
}

const MAX_ADDITIONAL_IMAGES = 9;

export default function ProductImageCard({
  options,
  storageFolder,
  mainImage,
  setMainImage,
  additionalImages,
  setAdditionalImages,
}: ProductImageCardProps) {
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleMainImg = () => {
    mainFileInputRef.current?.click();
  };

  const handleAdditionalImg = () => {
    if (additionalImages.length >= MAX_ADDITIONAL_IMAGES) {
      alert(`추가 이미지는 최대 ${MAX_ADDITIONAL_IMAGES}개까지 등록 가능합니다.`);
      return;
    }
    additionalFileInputRef.current?.click();
  };

  const handleChangeImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    try {
      const ext = getFileExtension(file);
      const fileName = `main.${ext}`;

      // Supabase Storage에 업로드
      const url = await uploadProductImage(
        browserClient,
        file,
        storageFolder,
        "images",
        fileName
      );

      setMainImage({ url, fileName });
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleChangeImages = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_ADDITIONAL_IMAGES - additionalImages.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    setIsUploading(true);

    try {
      const uploadedImages: ProductImage[] = [];

      for (let i = 0; i < filesToAdd.length; i++) {
        const file = filesToAdd[i];
        const ext = getFileExtension(file);
        const currentIndex = additionalImages.length + i;
        const fileName = `additional_${currentIndex + 1}.${ext}`;

        const url = await uploadProductImage(
          browserClient,
          file,
          storageFolder,
          "images",
          fileName
        );

        uploadedImages.push({ url, fileName });
      }

      setAdditionalImages([...additionalImages, ...uploadedImages]);

      if (files.length > remainingSlots) {
        alert(
          `추가 이미지는 최대 ${MAX_ADDITIONAL_IMAGES}개까지 등록 가능합니다. ${remainingSlots}개만 추가되었습니다.`
        );
      }
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMainImage = () => {
    if (mainImage) {
      setMainImage(undefined);
      // TODO: Storage에서도 삭제할지 결정 (등록 완료 전이므로 보류)
    }
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
    // TODO: Storage에서도 삭제할지 결정 (등록 완료 전이므로 보류)
  };

  return (
    <Card>
      <h2 className="text-xl font-bold">상품 이미지</h2>
      <Tabs defaultValue="default">
        <TabsList>
          <TabsTrigger value="default">기본 등록</TabsTrigger>
          <TabsTrigger value="option">옵션별 등록</TabsTrigger>
        </TabsList>
        <TabsContent value="default">
          <div className="flex flex-col gap-6 pt-2">
            {/* 대표이미지 */}
            <div className="flex flex-col gap-2">
              <Label>대표이미지</Label>
              <div className="flex gap-2">
                {!mainImage ? (
                  <div
                    className="flex justify-center items-center w-30 h-30 bg-gray-100 border border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={handleMainImg}
                  >
                    {isUploading ? (
                      <Loader className="w-6 h-6 text-gray-400 animate-spin" />
                    ) : (
                      <Plus className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                ) : (
                  <div className="relative w-30 h-30 group">
                    <img
                      src={mainImage.url}
                      alt="대표 이미지"
                      className="w-full h-full object-cover rounded border border-gray-200"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleRemoveMainImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={mainFileInputRef}
                onChange={handleChangeImage}
                name="main_image"
              />
            </div>

            {/* 추가이미지 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label>추가이미지</Label>
                <Label className="text-xs text-gray-500">
                  {additionalImages.length}/{MAX_ADDITIONAL_IMAGES}
                </Label>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <div
                  className="shrink-0 flex justify-center items-center w-30 h-30 bg-gray-100 border border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={handleAdditionalImg}
                >
                  {isUploading ? (
                    <Loader className="w-6 h-6 text-gray-400 animate-spin" />
                  ) : (
                    <Plus className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                {additionalImages.map((image, index) => (
                  <div key={index} className="relative w-30 h-30 shrink-0 group">
                    <img
                      src={image.url}
                      alt={`추가 이미지 ${index + 1}`}
                      className="w-full h-full object-cover rounded border border-gray-200"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveAdditionalImage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={additionalFileInputRef}
                multiple
                onChange={handleChangeImages}
                name="additional_images"
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="option">
          <DataGrid data={[]} columns={[]} onChange={() => {}} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
