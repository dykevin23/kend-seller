import { Form } from "react-router";
import Card from "~/common/components/card";
import Content from "~/common/components/content";
import RadioGroup from "~/common/components/radio-group";
import Select from "~/common/components/select";
import TextField from "~/common/components/text-field";
import Title from "~/common/components/title";
import { Button } from "~/common/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/common/components/ui/table";
import { option_groups, products_main_category } from "~/seeds";
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
import { useState } from "react";
import { Label } from "~/common/components/ui/label";
import { Plus } from "lucide-react";

interface ProductOptionProps {
  optionKey: string;
  optionName: string;
  values: string[];
}

interface ProductOptionArrayProps {
  id: string;
  stocks: number;
  price: number;
  [key: string]: any;
}

export const columns: ColumnDef<ProductOptionArrayProps>[] = [
  {
    accessorKey: "optionKey",
    header: ({ columns }) => <span>옵션</span>,
    cell: ({ row }) => {
      console.log("### row => ", row);
      return <div>{row.getValue("optionKey")}</div>;
    },
  },
  {
    accessorKey: "optionValue",
    header: ({ columns }) => <span>옵션명</span>,
    cell: ({ row }) => <div>{row.getValue("optionName")}</div>,
  },
  {
    accessorKey: "optionValue",
    header: ({ columns }) => <span>옵션값</span>,
    cell: ({ row }) => <div>{row.getValue("optionName")}</div>,
  },
  {
    accessorKey: "stocks",
    header: ({ columns }) => <span>재고</span>,
    cell: ({ row }) => <div>{row.getValue("stocks")}</div>,
  },
  {
    accessorKey: "price",
    header: ({ columns }) => <span>판매가격</span>,
    cell: ({ row }) => <div>{row.getValue("price")}</div>,
  },
];

export default function SubmitProductPage() {
  const [productOptions, setProductOptions] = useState<ProductOptionProps[]>([
    { optionKey: "COLOR", optionName: "색상", values: ["white", "black"] },
    {
      optionKey: "SIZE",
      optionName: "사이즈",
      values: ["Large", "Medium", "Small"],
    },
  ]);

  const [data, setData] = useState<ProductOptionArrayProps[]>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
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
  });

  const handleChangeOptionKey = (i: number) => (v: string) => {
    console.log("### handleChangeOptionKey => ", v, i);
    setProductOptions((prev) => {
      return prev.map((item, index) => {
        const option = option_groups.find((option) => option.group_key === v);
        return index === i
          ? { optionKey: v, optionName: option?.group_name, values: [] }
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

  // black, white
  // large, medium, small

  // {
  //             id: `sku-${i + 1}-${index + 1}`,
  //             optionKey: optionKey,
  //             optionName: optionName,
  //             stocks: 0,
  //             price: 0,
  //             [`option-${i}`]: value,
  //           }

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
        price: 0,
        stocks: 0,
        ...Object.assign(
          {},
          ...optionKeys.map((key, i) => ({ [key]: item[i] }))
        ),
      };
    }) as ProductOptionArrayProps[];

    console.log("### list => ", list);
    setData(list);
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

  return (
    <Content className="">
      <Title title="상품 등록" />

      {/* <Form className="grid grid-cols-2 gap-10 mx-auto"> */}
      <Form className="space-y-5">
        <Card>
          <h2 className="text-xl font-bold">상품 기본정보</h2>
          <div className="grid grid-cols-2 gap-10 mx-auto">
            <div className="space-y-5">
              <TextField id="name" name="name" label="상품명" />
              <RadioGroup
                label="성별"
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
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* 옵션 데이터 테이블 end */}
        </Card>

        {/* <div className="space-y-5">
          <Editor />
        </div> */}
      </Form>
    </Content>
  );
}
