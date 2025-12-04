import type { InputHTMLAttributes } from "react";
import { Label } from "./ui/label";
import {
  Select as SelectWrap,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "./ui/select";

interface SelectOptionProps {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: SelectOptionProps[];
  onChange?: (value: string) => void;
}

export default function Select({
  label,
  options,
  ...rest
}: SelectProps & Omit<InputHTMLAttributes<HTMLSelectElement>, "onChange">) {
  return (
    <div className="flex flex-col w-full space-y-3">
      {label && <Label htmlFor={rest.id}>{label}</Label>}
      <SelectWrap onValueChange={rest?.onChange}>
        <SelectTrigger className="w-full" disabled={options.length === 0}>
          <SelectValue placeholder={rest.placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </SelectWrap>
    </div>
  );
}
