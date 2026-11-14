import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex min-h-[48px] w-full rounded-m3-md border border-purple-400/35 bg-[#12002b]/90 px-4 py-2.5 text-base text-white placeholder:text-purple-300/50 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white focus-visible:border-[#AB1E2C] disabled:cursor-not-allowed disabled:opacity-50",
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
