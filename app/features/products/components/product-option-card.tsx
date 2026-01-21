import { Plus } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import Card from "~/common/components/card";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import { Button } from "~/common/components/ui/button";
import { Label } from "~/common/components/ui/label";
import { type ColumnDef } from "@tanstack/react-table";
import DataGrid from "~/common/components/data-grid";
import type { SystemOption } from "~/types/system";

interface ProductOptionProps {
  optionKey: string;
  optionName: string;
  values: string[];
}

export interface ProductOptionArrayProps {
  id: string;
  stocks: number;
  regularPrice: number;
  salePrice: number;
  [key: string]: any;
}

interface ProductOptionCardProps {
  data: ProductOptionArrayProps[];
  setData: Dispatch<SetStateAction<ProductOptionArrayProps[]>>;
  systemOptions: SystemOption[];
}

export default function ProductOptionCard({
  data,
  setData,
  systemOptions,
}: ProductOptionCardProps) {
  const [productOptions, setProductOptions] = useState<ProductOptionProps[]>([
    { optionKey: "", optionName: "", values: [] },
  ]);

  const handleChangeOptionKey = (i: number) => (v: string) => {
    setProductOptions((prev) => {
      return prev.map((item, index) => {
        const option = systemOptions.find((option) => option.code === v);
        return index === i
          ? { optionKey: v, optionName: option?.name || "", values: [""] }
          : item;
      });
    });
  };

  const handleChangeOptionValue =
    (i: number) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const {
        target: { value },
      } = event;

      setProductOptions((prev) => {
        return prev.map((item, index) => {
          return index === i ? { ...item, values: value.split(",") } : item;
        });
      });
    };

  const handleAddOptions = () => {
    if (
      !productOptions.find(
        (option) => option.optionKey === "" || option.values.length === 0
      )
    ) {
      setProductOptions([
        ...productOptions,
        { optionKey: "", optionName: "", values: [] },
      ]);
    }
  };

  // 옵션 추가하기 버튼 클릭 시 SKU 목록 생성
  const handleAddOption = () => {
    // 유효한 옵션만 필터링 (optionKey와 values가 있는 것만)
    const validOptions = productOptions.filter(
      (opt) => opt.optionKey !== "" && opt.values.length > 0 && opt.values[0] !== ""
    );

    if (validOptions.length === 0) {
      return;
    }

    const optionKeys = validOptions.map((item) => item.optionKey);
    const values = validOptions.map((item) => item.values);

    const skuItems = values.reduce(
      (acc, curr) => {
        const result = [];
        for (const a of acc) {
          for (const b of curr) {
            result.push([...a, b]);
          }
        }
        return result;
      },
      [[]] as string[][]
    );

    const list = skuItems.map((item, index) => {
      return {
        id: `sku-${index}`,
        regularPrice: 0,
        salePrice: 0,
        stocks: 0,
        options: Object.assign(
          {},
          ...optionKeys.map((key, i) => ({ [key]: item[i] }))
        ),
      };
    }) as ProductOptionArrayProps[];

    setData(list);
  };

  // 테이블 컬럼은 실제 data 기반으로 생성 (옵션 추가하기 버튼 클릭 후에만 반영)
  const getColumnsFromData = () => {
    if (data.length === 0) return [];
    const optionKeys = Object.keys(data[0].options || {});
    return optionKeys.map((key) => {
      const option = systemOptions.find((opt) => opt.code === key);
      return {
        accessorKey: `option-${key}`,
        header: () => <span>{option?.name || key}</span>,
        cell: ({ row }: { row: any }) => {
          const options = row.getValue("options") as { [key: string]: any };
          return <div>{options[key]}</div>;
        },
      };
    });
  };

  const columns: ColumnDef<ProductOptionArrayProps>[] = [
    {
      accessorKey: "options",
      header: () => <span>옵션</span>,
      columns: getColumnsFromData(),
    },
    {
      accessorKey: "regularPrice",
      header: () => <span>정상가</span>,
      meta: { editable: true, isNumber: true },
    },
    {
      accessorKey: "salePrice",
      header: () => <span>판매가</span>,
      meta: { editable: true, isNumber: true },
    },
    {
      accessorKey: "stocks",
      header: () => <span>재고</span>,
      meta: { editable: true, isNumber: true },
    },
    {
      accessorKey: "delete",
      header: () => <span>삭제</span>,
      cell: () => <Button type="button">삭제</Button>,
    },
  ];

  return (
    <Card>
      <h2 className="text-xl font-bold">옵션 등록</h2>
      <div className="flex flex-col space-y-1">
        <div className="flex w-3/4 gap-4">
          <Label className="w-full">옵션명</Label>
          <Label className="w-full">옵션값</Label>
        </div>
        {productOptions.map((option, index) => {
          // 이미 선택된 옵션 키 목록 (현재 인덱스 제외)
          const selectedOptionKeys = productOptions
            .map((opt, idx) => idx !== index && opt.optionKey)
            .filter((key) => key !== false && key !== "");

          return (
            <div className="flex" key={index}>
              <div className="flex w-3/4 gap-4 pr-2">
                <Select
                  options={systemOptions.map((sysOption) => ({
                    label: sysOption.name,
                    value: sysOption.code,
                    disabled: selectedOptionKeys.includes(sysOption.code),
                  }))}
                  value={option.optionKey}
                  onChange={handleChangeOptionKey(index)}
                />
                <TextField
                  value={option.values.join(",")}
                  onChange={handleChangeOptionValue(index)}
                />
              </div>
              <Button type="button" size="icon-sm" onClick={handleAddOptions}>
                <Plus />
              </Button>
            </div>
          );
        })}

        <div>
          <Button type="button" onClick={handleAddOption}>옵션 추가하기</Button>
        </div>
      </div>

      <DataGrid columns={columns} data={data} onChange={(v) => setData(v)} />
    </Card>
  );
}
