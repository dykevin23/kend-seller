import type { InputHTMLAttributes } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface TextFieldProps
  extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  direction?: "col" | "row";
  outsideAdornment?: React.ReactNode;
}

export default function TextField({
  label,
  direction = "col",
  outsideAdornment,
  ...rest
}: TextFieldProps) {
  return direction === "col" ? (
    <div className="flex flex-col w-full space-y-3">
      {label && <Label htmlFor={rest.id}>{label}</Label>}
      <Input className="text-sm" {...rest} />
    </div>
  ) : (
    <div className="flex px-4">
      <Label htmlFor={rest.id} className="w-48 shrink-0 text-sm">
        {label}
      </Label>

      <div className="flex flex-1 items-center gap-2">
        <Input className="flex-1" {...rest} />
        {outsideAdornment}
      </div>
    </div>
  );
}
