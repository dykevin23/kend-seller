import { useState } from "react";
import Card from "~/common/components/card";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import { Button } from "~/common/components/ui/button";
import DataGrid from "~/common/components/data-grid";
import type { ColumnDef } from "@tanstack/react-table";
import type { SystemOption } from "~/types/system";
import { formatNumber, parseNumber } from "~/common/utils/format";

export interface NewSkuRow {
  id: string;
  options: Record<string, string>;
  regularPrice: number;
  salePrice: number;
  stocks: number;
}

interface ExistingOption {
  system_option_id: string;
  option: string;
  system_option: { code: string; name: string } | null;
}

interface AddProductOptionCardProps {
  existingOptions: ExistingOption[];
  systemOptions: SystemOption[];
  data: NewSkuRow[];
  setData: (rows: NewSkuRow[]) => void;
}

const BULK_FIELDS = [
  { key: "regularPrice", label: "정상가" },
  { key: "salePrice", label: "판매가" },
  { key: "stocks", label: "재고" },
] as const;

export default function AddProductOptionCard({
  existingOptions,
  systemOptions,
  data,
  setData,
}: AddProductOptionCardProps) {
  // 이미 등록된 옵션 키(예: 색상, 사이즈)에 새 값만 추가할 수 있게 한다.
  // 기존 SKU에 없던 새 옵션 축을 지금 추가하면 기존 SKU들은 그 축의 값이
  // 정의되지 않는 문제가 생기므로, 값 추가만 허용하고 축 추가는 막는다.
  const existingKeys = Array.from(
    new Set(
      existingOptions.map((o) => o.system_option?.code).filter(Boolean)
    )
  ) as string[];

  const valuesByKey: Record<string, string[]> = {};
  existingOptions.forEach((o) => {
    const code = o.system_option?.code;
    if (!code) return;
    if (!valuesByKey[code]) valuesByKey[code] = [];
    if (!valuesByKey[code].includes(o.option)) valuesByKey[code].push(o.option);
  });

  const [selectedKey, setSelectedKey] = useState(existingKeys[0] || "");
  const [newValues, setNewValues] = useState("");

  const handleAdd = () => {
    if (!selectedKey) return;
    const values = Array.from(
      new Set(
        newValues
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      )
    );
    if (values.length === 0) return;

    const alreadyQueued = data
      .filter((row) => row.options[selectedKey])
      .map((row) => row.options[selectedKey]);

    const duplicateValues = values.filter(
      (v) =>
        (valuesByKey[selectedKey] || []).includes(v) ||
        alreadyQueued.includes(v)
    );
    if (duplicateValues.length > 0) {
      alert(`이미 등록되어 있거나 추가 대기 중인 값입니다: ${duplicateValues.join(", ")}`);
    }

    const uniqueNewValues = values.filter((v) => !duplicateValues.includes(v));
    if (uniqueNewValues.length === 0) return;

    const otherKeys = existingKeys.filter((k) => k !== selectedKey);

    // 다른 옵션 축들의 기존 값 조합(cartesian product) — 새 값은 이
    // 조합들 각각에 대해 추가되어야 한다
    let otherCombos: Record<string, string>[] = [{}];
    otherKeys.forEach((key) => {
      const vals = valuesByKey[key] || [];
      if (vals.length === 0) return;
      const next: Record<string, string>[] = [];
      otherCombos.forEach((combo) => {
        vals.forEach((v) => next.push({ ...combo, [key]: v }));
      });
      otherCombos = next;
    });

    const existingComboKeys = new Set(
      data.map((row) => JSON.stringify(Object.entries(row.options).sort()))
    );

    const newRows: NewSkuRow[] = [];
    uniqueNewValues.forEach((value) => {
      otherCombos.forEach((combo) => {
        const options = { ...combo, [selectedKey]: value };
        const comboKey = JSON.stringify(Object.entries(options).sort());
        if (existingComboKeys.has(comboKey)) return;
        existingComboKeys.add(comboKey);
        newRows.push({
          id: `new-${crypto.randomUUID()}`,
          options,
          regularPrice: 0,
          salePrice: 0,
          stocks: 0,
        });
      });
    });

    setData([...data, ...newRows]);
    setNewValues("");
  };

  const handleRemoveRow = (id: string) => {
    setData(data.filter((row) => row.id !== id));
  };

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
    setData(data.map((row) => ({ ...row, [field]: value })));
  };

  const optionKeysInData = Array.from(
    new Set(data.flatMap((row) => Object.keys(row.options)))
  );

  const optionColumns = optionKeysInData.map((key) => {
    const option = systemOptions.find((opt) => opt.code === key);
    return {
      accessorKey: `option-${key}`,
      header: () => <span>{option?.name || key}</span>,
      cell: ({ row }: { row: any }) => {
        const options = row.getValue("options") as Record<string, string>;
        return <div>{options[key] ?? "-"}</div>;
      },
    };
  });

  const columns: ColumnDef<NewSkuRow>[] = [
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
      cell: ({ row }: { row: any }) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleRemoveRow(row.original.id)}
        >
          삭제
        </Button>
      ),
    },
  ];

  if (existingKeys.length === 0) {
    return (
      <Card>
        <h2 className="text-xl font-bold">새 옵션 추가</h2>
        <p className="text-sm text-muted-foreground">
          이 상품에는 등록된 옵션이 없어 새 옵션을 추가할 수 없습니다.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-bold">새 옵션 추가</h2>
      <p className="text-sm text-muted-foreground">
        기존 옵션(색상/사이즈 등)에 새로운 값을 추가할 수 있습니다. 이미
        등록된 옵션 조합의 가격/재고는 이 화면에서 수정할 수 없습니다. 이
        상품에 없던 새 옵션 축은 추가할 수 없습니다 — 이 경우 새 상품으로
        등록해주세요.
      </p>
      <div className="flex items-end gap-3">
        <div className="w-48">
          <Select
            label="옵션"
            options={existingKeys.map((key) => ({
              label: systemOptions.find((opt) => opt.code === key)?.name || key,
              value: key,
            }))}
            value={selectedKey}
            onChange={setSelectedKey}
          />
        </div>
        <div className="flex-1">
          <TextField
            label="추가할 값 (쉼표로 구분)"
            value={newValues}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewValues(e.target.value)
            }
            placeholder="예: XL, XXL"
          />
        </div>
        <Button type="button" onClick={handleAdd}>
          추가
        </Button>
      </div>

      {data.length > 0 && (
        <>
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
          <DataGrid columns={columns} data={data} onChange={(v) => setData(v)} />
        </>
      )}
    </Card>
  );
}
