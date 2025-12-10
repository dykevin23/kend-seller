import { Plus } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import Card from "~/common/components/card";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import { Button } from "~/common/components/ui/button";
import { Label } from "~/common/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";
import { option_groups } from "~/seeds";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";

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
}

export default function ProductOptionCard({
  data,
  setData,
}: ProductOptionCardProps) {
  //   const useSkipper = () => {
  //     const shouldSkipRef = useRef(true);
  //     const shouldSkip = shouldSkipRef.current;

  //     // Wrap a function with this to skip a pagination reset temporarily
  //     const skip = useCallback(() => {
  //       shouldSkipRef.current = false;
  //     }, []);

  //     useEffect(() => {
  //       shouldSkipRef.current = true;
  //     });

  //     return [shouldSkip, skip] as const;
  //   };

  const [productOptions, setProductOptions] = useState<ProductOptionProps[]>([
    { optionKey: "COLOR", optionName: "색상", values: ["white", "black"] },
    {
      optionKey: "SIZE",
      optionName: "사이즈",
      values: ["Large", "Medium", "Small"],
    },
  ]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  //   const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  const handleChangeOptionKey = (i: number) => (v: string) => {
    setProductOptions((prev) => {
      return prev.map((item, index) => {
        const option = option_groups.find((option) => option.group_key === v);
        return index === i
          ? { optionKey: v, optionName: option?.group_name || "", values: [""] }
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
          return index === i ? { ...prev, values: value.split(",") } : item;
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

  const handleAddOption = () => {
    const optionKeys = productOptions.map((item) => item.optionKey);
    const values = productOptions.map((item) => item.values);

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

  const defaultColumn: Partial<ColumnDef<ProductOptionArrayProps>> = {
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
      const initialValue = getValue() as number;
      // We need to keep and update the state of the cell normally
      const [value, setValue] = useState<string>("");

      // When the input is blurred, we'll call our table meta's updateData function
      const onBlur = () => {
        table.options.meta?.updateData(index, id, value);
      };

      // If the initialValue is changed external, sync it up with our state
      useEffect(() => {
        if (initialValue !== 0) {
          setValue(String(initialValue));
        }
      }, [initialValue]);

      return (
        <TextField
          value={value}
          placeholder="0"
          onBlur={onBlur}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    },
  };

  const columns: ColumnDef<ProductOptionArrayProps>[] = [
    {
      accessorKey: "options",
      header: () => <span>옵션</span>,
      columns: productOptions.map((option, index) => {
        return {
          accessorKey: `option-${option.optionKey}`,
          header: () => <span>{option.optionName}</span>,
          cell: ({ row }: { row: any }) => {
            const options = row.getValue("options") as { [key: string]: any };
            return <div>{Object.values(options)[index]}</div>;
          },
        };
      }),
    },
    { accessorKey: "regularPrice", header: () => <span>정상가</span> },
    { accessorKey: "salePrice", header: () => <span>판매가</span> },
    { accessorKey: "stocks", header: () => <span>재고</span> },
    {
      accessorKey: "delete",
      header: () => <span>삭제</span>,
      cell: () => <Button>삭제</Button>,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    defaultColumn,
    // onSortingChange: setSorting,
    // onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      // sorting,
      // columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      updateData: (rowIndex: number, columnId: string, value: unknown) => {
        // Skip page index reset until after next rerender
        // skipAutoResetPageIndex();
        setData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex]!,
                [columnId]: value,
              };
            }
            return row;
          })
        );
      },
    },
    debugTable: true,
  });

  return (
    <Card>
      <h2 className="text-xl font-bold">옵션 등록</h2>
      <div className="flex flex-col space-y-1">
        <div className="flex w-3/4 gap-4">
          <Label className="w-full">옵션명</Label>
          <Label className="w-full">옵션값</Label>
        </div>
        {productOptions.map((option, index) => (
          <div className="flex" key={index}>
            <div className="flex w-3/4 gap-4 pr-2">
              <Select
                options={option_groups.map((option) => ({
                  label: option.group_name,
                  value: option.group_key,
                }))}
                value={option.optionKey}
                onChange={handleChangeOptionKey(index)}
              />
              <TextField
                value={option.values.join(",")}
                // onChange={(e) => console.log("### onChange => ", e)}
                onChange={handleChangeOptionValue(index)}
              />
            </div>
            <Button size="icon-sm" onClick={handleAddOptions}>
              <Plus />
            </Button>
          </div>
        ))}

        <div>
          <Button onClick={handleAddOption}>옵션 추가하기</Button>
        </div>
      </div>

      {/* 옵션 데이터 테이블 start */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => {
                  const rowSpan =
                    header.depth === 1 && header.subHeaders.length === 1
                      ? 2
                      : 1;

                  return header.depth === 1 || header.column.parent ? (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      rowSpan={rowSpan}
                      className="text-center"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ) : (
                    <></>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row: any) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell: any) => (
                  <TableCell key={cell.id} className="text-center">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* 옵션 데이터 테이블 end */}
    </Card>
  );
}
