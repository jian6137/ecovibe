import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[104px] w-full rounded-m3-sm border border-m3-outline-variant bg-m3-surface-container-lowest px-4 py-3 text-base text-m3-on-surface placeholder:text-m3-on-surface-variant transition-colors focus-visible:border-m3-primary disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
