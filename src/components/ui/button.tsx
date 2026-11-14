import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-m3-xl text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#A8002D] text-white shadow-glow-red hover:bg-[#AB1E2C] active:bg-[#8a0024] border border-[#ff4d73]/30",
        secondary:
          "bg-[#5101be] text-white shadow-glow-purple hover:bg-[#6211d4] active:bg-[#3f0196] border border-purple-400/30",
        outline:
          "border border-[#7959b8]/60 bg-[#20034d]/70 text-purple-100 hover:bg-[#5101be]/40 hover:border-[#AB1E2C]",
        tonal:
          "bg-[#2c0468] text-purple-100 hover:bg-[#390585] border border-purple-400/20",
        ghost:
          "text-purple-200 hover:bg-[#5101be]/30 hover:text-white",
        destructive:
          "bg-[#AB1E2C] text-white hover:bg-[#A8002D] shadow-m3-2",
        link: "text-[#ff859d] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-m3-lg px-4 text-xs",
        lg: "h-13 rounded-m3-xl px-8 py-3.5 text-base",
        icon: "h-11 w-11 rounded-full",
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
