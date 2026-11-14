import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-m3-sm px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-m3-primary-container text-m3-on-primary-container",
        secondary:
          "bg-m3-secondary-container text-m3-on-secondary-container",
        outline:
          "border border-m3-outline-variant bg-transparent text-m3-on-surface-variant",
        alert:
          "bg-m3-tertiary-container text-m3-on-tertiary-container",
        success:
          "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
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
