import Card from "~/common/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/common/components/ui/tabs";
import type { ProductOptionArrayProps } from "./product-option-card";
import { Label } from "~/common/components/ui/label";
import { Input } from "~/common/components/ui/input";
import { Plus } from "lucide-react";
import { Separator } from "~/common/components/ui/separator";
import { useRef, useState } from "react";
import DataGrid from "~/common/components/data-grid";

interface ProductImageCardProps {
  options: ProductOptionArrayProps[];
}

interface Image {
  url: string;
  file: File;
}

export default function ProductImageCard({ options }: ProductImageCardProps) {
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);
  const [mainImage, setMainImage] = useState<Image>();
  const [additionalImages, setAdditionalImages] = useState<Image[]>([]);

  const handleMainImg = () => {
    mainFileInputRef.current?.click();
  };

  const handleAdditionalImg = () => {
    additionalFileInputRef.current?.click();
  };

  const handleChangeImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setMainImage({ file: files[0], url: URL.createObjectURL(files[0]) });
  };

  const handleChangeImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: Image[] = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setAdditionalImages((prev) => [...prev, ...newImages]);
  };

  // console.log("### options => ", options);

  return (
    <Card>
      <h2 className="text-xl font-bold">상품 이미지</h2>
      <Tabs defaultValue="default">
        <TabsList>
          <TabsTrigger value="default">기본 등록</TabsTrigger>
          <TabsTrigger value="option">옵션별 등록</TabsTrigger>
        </TabsList>
        <TabsContent value="default">
          <div className="grid grid-cols-4 pt-2">
            <div className="flex flex-col w-full gap-4">
              <Label>대표이미지</Label>
              <div className="flex justify-center">
                <div
                  className="flex justify-center items-center size-30 bg-gray-100 border-1 border-dashed"
                  onClick={handleMainImg}
                >
                  <Plus />
                </div>
              </div>

              {mainImage && (
                <div className="relative size-40 rounded-xl">
                  <img src={mainImage.url} className="" />
                </div>
              )}

              <Input
                type="file"
                className="hidden"
                ref={mainFileInputRef}
                onChange={handleChangeImage}
                required
                name="main_image"
              />
            </div>
            <div className="flex flex-col w-full gap-4">
              <div className="flex gap-1">
                <Label>추가이미지</Label>
                <Label className="text-xs">{`(${additionalImages.length}/9)`}</Label>
              </div>
              <div className="flex justify-center">
                <div
                  className="flex justify-center items-center size-30 bg-gray-100 border-1 border-dashed"
                  onClick={handleAdditionalImg}
                >
                  <Plus />
                </div>
              </div>
              <div className="flex flex-col justify-end items-start">
                <div className="flex items-center pr-10">
                  {additionalImages.map((image) => (
                    <div className="relative size-40 rounded-xl">
                      <img src={image.url} className="" />
                    </div>
                  ))}
                </div>
              </div>
              <Input
                type="file"
                className="hidden"
                ref={additionalFileInputRef}
                multiple
                onChange={handleChangeImages}
                required
                name="additional_images"
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="option">
          <DataGrid data={[]} columns={[]} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
