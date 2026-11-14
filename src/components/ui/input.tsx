import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex min-h-[48px] w-full rounded-m3-sm border border-m3-outline-variant bg-m3-surface-container-lowest px-4 py-2.5 text-base text-m3-on-surface placeholder:text-m3-on-surface-variant transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-m3-on-surface focus-visible:border-m3-primary disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
