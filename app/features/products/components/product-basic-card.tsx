import Card from "~/common/components/card";
import RadioGroup from "~/common/components/radio-group";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import { products_main_category } from "~/seeds";

export default function ProductBasicCard() {
  return (
    <Card>
      <h2 className="text-xl font-bold">상품 기본정보</h2>
      <div className="grid grid-cols-2 gap-10 mx-auto">
        <div className="space-y-5">
          <TextField id="productName" name="productName" label="상품명" />
          <RadioGroup
            label="성별"
            name="sex"
            options={[
              { label: "남성", value: "male" },
              { label: "여성", value: "female" },
              { label: "남녀공용", value: "unisex" },
            ]}
          />
        </div>
        <div className="space-y-5">
          <TextField
            id="classification_code"
            name="classification_code"
            label="상품분류"
            value="패션"
            disabled
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-10 mx-auto">
        <div className="space-y-5">
          <Select
            label="카테고리"
            options={products_main_category.map((item) => {
              return { label: item.group_name, value: item.group_code };
            })}
          />
        </div>
        <div className="space-y-5">
          <Select label="상세 카테고리" options={[]} />
        </div>
      </div>
    </Card>
  );
}
