import Card from "~/common/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/common/components/ui/tabs";
import type { ProductOptionArrayProps } from "./product-option-card";

interface ProductImageCardProps {
  options: ProductOptionArrayProps[];
}

export default function ProductImageCard() {
  return (
    <Card>
      <h2 className="text-xl font-bold">상품 이미지</h2>
      <Tabs defaultValue="default">
        <TabsList>
          <TabsTrigger value="default">기본 등록</TabsTrigger>
          <TabsTrigger value="option">옵션별 등록</TabsTrigger>
        </TabsList>
        <TabsContent value="default"></TabsContent>
        <TabsContent value="option"></TabsContent>
      </Tabs>
    </Card>
  );
}
