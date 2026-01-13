import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type CellContext,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useEffect, useState } from "react";
import TextField from "./text-field";

interface DataGridProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onChange: (values: T[]) => void;
}

// Editable Cell 컴포넌트
function EditableCell<T>({ getValue, row: { index }, column, table }: CellContext<T, unknown>) {
  const initialValue = getValue();
  const [value, setValue] = useState<string>("");

  const onBlur = () => {
    table.options.meta?.updateData(index, column.id, value);
  };

  useEffect(() => {
    if (initialValue != null && initialValue !== "") {
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
}

export default function DataGrid<T>({
  data,
  columns,
  onChange,
}: DataGridProps<T>) {
  const defaultColumn: Partial<ColumnDef<T>> = {
    cell: (props) => {
      const { column } = props;

      // editable이면 EditableCell 사용
      if (column.columnDef.meta?.editable) {
        return <EditableCell {...props} />;
      }

      // editable이 아니면 기본 값 렌더링
      return props.getValue() as any;
    },
  };

  const table = useReactTable({
    data,
    columns,
    defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex: number, columnId: string, value: unknown) => {
        const result = data.map((row, index) => {
          if (index === rowIndex) {
            return {
              ...data[rowIndex]!,
              [columnId]: value,
            };
          }
          return row;
        });

        onChange(result);
      },
    },
  });

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                // 1depth grouped column 처리
                // depth 1: 최상위 헤더
                // depth 2: 하위 헤더 (grouped column의 자식)
                const isTopLevel = header.depth === 1;
                const hasSubHeaders =
                  header.subHeaders && header.subHeaders.length > 1;
                const isSubHeader = header.column.parent;

                // depth 1이고 subHeaders가 1개면 단일 컬럼 (rowspan 2)
                // depth 1이고 subHeaders가 여러개면 grouped 컬럼 (colspan N)
                // depth 2면 하위 헤더
                if (isTopLevel) {
                  // 최상위 헤더
                  const rowSpan = hasSubHeaders ? 1 : 2;
                  const colSpan = hasSubHeaders ? header.subHeaders.length : 1;

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={colSpan}
                      rowSpan={rowSpan}
                      className="text-center"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  );
                } else if (isSubHeader) {
                  // 하위 헤더 (grouped column의 자식)
                  return (
                    <TableHead key={header.id} className="text-center">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  );
                }

                return null;
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => {
                const align = cell.column.columnDef.meta?.align ?? "center";
                return (
                  <TableCell
                    key={cell.id}
                    className={
                      align === "right"
                        ? "text-right"
                        : align === "center"
                          ? "text-center"
                          : "text-left"
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
