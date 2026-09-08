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
import { formatNumber, parseNumber } from "~/common/utils/format";

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

const BULK_FIELDS = [
  { key: "regularPrice", label: "정상가" },
  { key: "salePrice", label: "판매가" },
  { key: "stocks", label: "재고" },
] as const;

export default function ProductOptionCard({
  data,
  setData,
  systemOptions,
}: ProductOptionCardProps) {
  const [productOptions, setProductOptions] = useState<ProductOptionProps[]>([
    { optionKey: "", optionName: "", values: [] },
  ]);

  // SKU가 많으면 한 칸씩 입력하기 번거로워서, 값 하나를 전체 행에 한 번에 적용하는 용도
  const [bulkValues, setBulkValues] = useState<Record<string, string>>({
    regularPrice: "",
    salePrice: "",
    stocks: "",
  });

  const handleBulkValueChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const cleaned = event.target.value.replace(/[^\d]/g, "");
      setBulkValues((prev) => ({ ...prev, [field]: formatNumber(cleaned) }));
    };

  const handleApplyBulkValue = (field: string) => {
    const value = Number(parseNumber(bulkValues[field] ?? ""));
    if (!bulkValues[field] || Number.isNaN(value)) return;
    setData((prev) => prev.map((row) => ({ ...row, [field]: value })));
  };

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

  // 옵션 키가 하나도 없으면(레거시 데이터 결함 등) "옵션" 그룹 컬럼 자체를
  // 뺀다 — 빈 columns 배열을 그대로 두면 tanstack-table이 leaf 컬럼으로
  // 취급해 옵션 객체를 그대로 렌더링하려다 "Objects are not valid as a
  // React child" 에러로 화면이 죽는다
  const optionColumns = getColumnsFromData();

  const columns: ColumnDef<ProductOptionArrayProps>[] = [
    ...(optionColumns.length > 0
      ? [
          {
            accessorKey: "options",
            header: () => <span>옵션</span>,
            columns: optionColumns,
          },
        ]
      : []),
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

      {data.length > 0 && (
        <div className="flex flex-wrap items-end gap-3 rounded-md border bg-muted/30 p-3">
          {BULK_FIELDS.map((field) => (
            <div key={field.key} className="flex items-end gap-1.5">
              <TextField
                label={`${field.label} 일괄`}
                value={bulkValues[field.key]}
                onChange={handleBulkValueChange(field.key)}
                placeholder="0"
                className="w-28 text-right"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleApplyBulkValue(field.key)}
              >
                전체 적용
              </Button>
            </div>
          ))}
        </div>
      )}

      <DataGrid columns={columns} data={data} onChange={(v) => setData(v)} />
    </Card>
  );
}
