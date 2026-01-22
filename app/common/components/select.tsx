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
import { cn } from "~/lib/utils";

interface SelectOptionProps {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  options: SelectOptionProps[];
  direction?: "row" | "col";
  onChange?: (value: string) => void;
  defaultValue?: string;
  value?: string;
}

export default function Select({
  label,
  options,
  direction = "col",
  defaultValue,
  value,
  onChange,
  ...rest
}: SelectProps & Omit<InputHTMLAttributes<HTMLSelectElement>, "onChange" | "value">) {
  return direction === "col" ? (
    <div className="flex flex-col w-full space-y-3">
      {label && <Label htmlFor={rest.id}>{label}</Label>}
      <SelectComponent
        options={options}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        {...rest}
      />
    </div>
  ) : (
    <div className="flex px-4">
      <Label htmlFor={rest.id} className="w-48 shrink-0 text-sm">
        {label}
      </Label>
      <SelectComponent
        options={options}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        {...rest}
      />
    </div>
  );
}

const SelectComponent = ({
  options,
  className,
  name,
  defaultValue,
  value,
  onChange,
  ...rest
}: Omit<SelectProps, "label" | "direction"> &
  Omit<InputHTMLAttributes<HTMLSelectElement>, "onChange" | "value">) => {
  return (
    <SelectWrap
      onValueChange={onChange}
      name={name}
      defaultValue={defaultValue}
      value={value}
    >
      <SelectTrigger
        className={cn("w-full", className)}
        disabled={options.length === 0}
      >
        <SelectValue placeholder={rest.placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </SelectWrap>
  );
};
