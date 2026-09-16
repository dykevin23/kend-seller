import * as React from "react";

import { cn } from "~/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onChange, pattern, inputMode, ...props }, ref) => {
    // type="number"는 브라우저 기본 위아래 화살표(스피너) UI가 따라와서
    // 쓰지 않기로 함(seller 전체 공통) — 대신 text로 렌더링하고 숫자
    // 이외 입력을 직접 걸러낸다. 호출부는 그대로 type="number"를 넘기면 됨.
    const isNumber = type === "number";

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (isNumber) {
        event.target.value = event.target.value.replace(/[^\d]/g, "");
      }
      onChange?.(event);
    };

    return (
      <input
        type={isNumber ? "text" : type}
        inputMode={isNumber ? "numeric" : inputMode}
        pattern={isNumber ? (pattern ?? "[0-9]*") : pattern}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-8 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
