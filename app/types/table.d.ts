import type { RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }

  interface ColumnMeta<TData extends RowData, TValue> {
    align?: "left" | "center" | "right";
    editable?: boolean;
    editType?: "input" | "select";
  }
}

export type AddressType = "shipping" | "return";
