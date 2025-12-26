import Card from "~/common/components/card";
import RadioGroup from "~/common/components/radio-group";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import { products_main_category } from "~/seeds";
import { GENDER_TYPES } from "../constrants";

export default function ProductBasicCard() {
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
            id="domain_id"
            name="domain_id"
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
            id="main_category"
            name="main_category"
            options={products_main_category.map((item) => {
              return { label: item.group_name, value: item.group_code };
            })}
          />
        </div>
        <div className="space-y-5">
          <Select
            label="상세 카테고리"
            id="sub_category"
            name="sub_category"
            options={[]}
          />
        </div>
      </div>
    </Card>
  );
}
