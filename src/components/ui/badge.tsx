import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-[#ff4d73]/40 bg-[#A8002D] text-white shadow-sm",
        secondary:
          "border-purple-400/35 bg-[#5101be] text-purple-50",
        outline:
          "border-purple-400/40 bg-[#1b0240]/80 text-purple-200",
        alert:
          "border-[#ff859d]/50 bg-[#AB1E2C]/90 text-white",
        success:
          "border-emerald-400/40 bg-emerald-950/80 text-emerald-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
