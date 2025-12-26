import type { InputHTMLAttributes } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface TextFieldProps
  extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  direction?: "col" | "row";
}

export default function TextField({
  label,
  direction = "col",
  ...rest
}: TextFieldProps) {
  return direction === "col" ? (
    <div className="flex flex-col w-full space-y-3">
      {label && <Label htmlFor={rest.id}>{label}</Label>}
      <Input className="text-sm" {...rest} />
    </div>
  ) : (
    <div className="flex px-4">
      <Label htmlFor={rest.id} className="w-1/4">
        {label}
      </Label>
      <TextField className="text-sm" {...rest} />
    </div>
  );
}
