import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-m3-full text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Material 3 Filled Button
        default:
          "bg-m3-primary text-m3-on-primary hover:shadow-m3-1 hover:brightness-105 active:brightness-95",
        // Material 3 Filled Tonal Button
        secondary:
          "bg-m3-secondary-container text-m3-on-secondary-container hover:brightness-95 active:brightness-90",
        // Material 3 Outlined Button (uses outline-variant)
        outline:
          "border border-m3-outline-variant bg-transparent text-m3-on-surface hover:bg-m3-surface-container-high",
        // Material 3 Primary Container Button
        tonal:
          "bg-m3-primary-container text-m3-on-primary-container hover:brightness-95",
        // Material 3 Text Button
        ghost:
          "text-m3-primary-text hover:bg-m3-surface-container-high",
        destructive:
          "bg-m3-error text-m3-on-error hover:brightness-105",
        link: "text-m3-primary-text underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-7 text-sm",
        icon: "h-10 w-10 rounded-m3-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
