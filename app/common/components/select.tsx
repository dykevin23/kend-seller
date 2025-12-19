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
  direction?: "row" | "col";
  onChange?: (value: string) => void;
}

export default function Select({
  label,
  options,
  direction = "col",
  ...rest
}: SelectProps & Omit<InputHTMLAttributes<HTMLSelectElement>, "onChange">) {
  return direction === "col" ? (
    <div className="flex flex-col w-full space-y-3">
      {label && <Label htmlFor={rest.id}>{label}</Label>}
      <SelectComponent options={options} {...rest} />
    </div>
  ) : (
    <div className="flex px-4">
      <Label htmlFor={rest.id} className="w-1/4">
        {label}
      </Label>
      <SelectComponent options={options} {...rest} />
    </div>
  );
}

const SelectComponent = ({
  options,
  ...rest
}: Omit<SelectProps, "label" | "direction"> &
  Omit<InputHTMLAttributes<HTMLSelectElement>, "onChange">) => {
  return (
    <SelectWrap onValueChange={rest?.onChange}>
      <SelectTrigger className="w-1/2" disabled={options.length === 0}>
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
  );
};
