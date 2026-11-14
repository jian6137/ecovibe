import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[104px] w-full rounded-m3-md border border-purple-400/35 bg-[#12002b]/90 px-4 py-3 text-base text-white placeholder:text-purple-300/50 transition-colors focus-visible:border-[#AB1E2C] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
