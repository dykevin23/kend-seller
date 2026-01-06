import { useNavigate, useOutletContext } from "react-router";
import Card from "~/common/components/card";
import TextField from "~/common/components/text-field";
import { Button } from "~/common/components/ui/button";
import type { Route } from "./+types/sub-category-page";

export default function SubCategoryPage({ params }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { categories } = useOutletContext<{ categories: any }>();

  const category = categories.find(
    (item) => item.id === Number(params.categoryId)
  );
  const subCategory = category?.children.find(
    (item) => item.id === Number(params.subCategoryId)
  );

  return (
    <div className="space-y-5">
      <Card>
        <h2 className="text-xl font-bold">하위 카테고리</h2>
        <TextField label="하위 카테고리" value={subCategory?.code} />
        <TextField label="하위 카테고리명" value={subCategory?.name} />
      </Card>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/system/categories")}
        >
          돌아가기
        </Button>
        <Button type="button">수정</Button>
      </div>
    </div>
  );
}
