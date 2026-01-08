import Card from "~/common/components/card";
import RadioGroup from "~/common/components/radio-group";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import { GENDER_TYPES } from "../constrants";
import { useRootData } from "~/hooks/useRootData";
import { useState } from "react";
import type { Category } from "~/types/system";

interface BasicCardProps {
  categories: Category[];
}

export default function ProductBasicCard({ categories }: BasicCardProps) {
  const { seller } = useRootData();
  const [selectedCategory, setSelectedCategory] = useState<{
    main: string;
    sub: string;
  }>({ main: "", sub: "" });

  const mainCategories = categories.filter(
    (item) => item.domainId === seller?.domain_id
  );

  const handleMainCategory = (value: string) => {
    setSelectedCategory((prev) => {
      return { main: value, sub: "" };
    });
  };

  return (
    <Card>
      <h2 className="text-xl font-bold">상품 기본정보</h2>
      <div className="grid grid-cols-2 gap-10 mx-auto">
        <div className="space-y-5">
          <TextField id="productName" name="productName" label="상품명" />
          <RadioGroup
            label="성별"
            id="gender"
            name="gender"
            options={GENDER_TYPES.map((type) => ({
              label: type.label,
              value: type.value,
            }))}
          />
        </div>
        <div className="space-y-5">
          <TextField
            id="domain"
            name="domain"
            label="상품분류"
            value={seller?.domain_name}
            disabled
          />
          <input
            className="hidden"
            id="domainId"
            name="domainId"
            value={seller?.domain_id}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-10 mx-auto">
        <div className="space-y-5">
          <Select
            label="카테고리"
            id="mainCategory"
            name="mainCategory"
            options={mainCategories.map((category) => ({
              label: category.name,
              value: category.id.toString(),
            }))}
            value={selectedCategory.main}
            onChange={handleMainCategory}
          />
        </div>
        <div className="space-y-5">
          <Select
            label="상세 카테고리"
            id="subCategory"
            name="subCategory"
            options={
              selectedCategory.main
                ? mainCategories
                    .find((item) => item.id === Number(selectedCategory.main))
                    ?.children.map((item) => ({
                      label: item.name,
                      value: item.id.toString(),
                    })) || []
                : []
            }
            value={selectedCategory.sub}
          />
        </div>
      </div>
    </Card>
  );
}
