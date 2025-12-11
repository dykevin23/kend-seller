import { cn } from "~/lib/utils";
import { Label } from "./ui/label";
import { RadioGroup as RadioGroupWrap, RadioGroupItem } from "./ui/radio-group";
import type { InputHTMLAttributes } from "react";

interface OptionProps {
  // key: string;
  label: string;
  value: string;
}

interface RadioGroupProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  options: OptionProps[];
  vertical?: boolean;
}

export default function RadioGroup({
  label,
  options,
  vertical = false,
  name,
  ...rest
}: RadioGroupProps) {
  return (
    <div className="flex flex-col space-y-3">
      {label && <Label>{label}</Label>}
      <RadioGroupWrap
        className={cn({
          "flex flex-col": vertical,
          "flex flex-row": !vertical,
        })}
        defaultValue={options[0].value}
        name={name}
      >
        {options.map((option) => (
          <div className="flex items-center gap-3" key={option.value}>
            <RadioGroupItem value={option.value} id={option.value} />
            <Label htmlFor={option.value}>{option.label}</Label>
          </div>
        ))}
      </RadioGroupWrap>
    </div>
  );
}
