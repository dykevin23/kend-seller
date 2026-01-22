import { useState } from "react";
import Card from "~/common/components/card";
import TextField from "~/common/components/text-field";
import { Checkbox } from "~/common/components/ui/checkbox";
import { Label } from "~/common/components/ui/label";
import { cn } from "~/lib/utils";

interface DefaultValues {
  brand?: string;
  maker?: string;
}

interface ProductDetailCardProps {
  defaultValues?: DefaultValues;
}

export default function ProductDetailCard({
  defaultValues,
}: ProductDetailCardProps) {
  const [nobrand, setNobrand] = useState<boolean>(!defaultValues?.brand);
  return (
    <Card>
      <h2 className="text-xl font-bold">상품 상세정보</h2>
      <div className="space-y-5">
        <div className="flex flex-col w-full space-y-3">
          <Label htmlFor="brand">브랜드</Label>

          <div className="flex gap-2">
            <TextField
              id="brand"
              name="brand"
              readOnly={nobrand}
              defaultValue={defaultValues?.brand}
              className={cn({
                "bg-gray-200": nobrand,
              })}
            />
            <div className="flex gap-1 w-full items-center">
              <Checkbox
                checked={nobrand}
                onClick={() => setNobrand(!nobrand)}
              />
              <Label className="text-xs">브랜드 없음(자체제작)</Label>
            </div>
          </div>
        </div>

        <TextField
          id="maker"
          name="maker"
          label="제조사"
          className="w-1/2"
          defaultValue={defaultValues?.maker}
        />
      </div>
    </Card>
  );
}
