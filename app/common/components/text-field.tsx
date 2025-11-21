import type { InputHTMLAttributes } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface TextFieldProps
  extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
}

export default function TextField({ label, ...rest }: TextFieldProps) {
  return (
    <div className="flex flex-col space-y-3">
      {label && <Label htmlFor={rest.id}>{label}</Label>}
      <Input {...rest} />
    </div>
  );
}
