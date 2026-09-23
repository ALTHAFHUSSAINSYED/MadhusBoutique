import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variants = {
      primary:
        "bg-[#6b1426] text-white hover:bg-[#520f1d] active:scale-[0.98] shadow-sm focus-visible:ring-[#6b1426]",
      secondary:
        "bg-[#f6efe2] text-[#4a1525] hover:bg-[#ede3d0] active:scale-[0.98] focus-visible:ring-[#4a1525]",
      outline:
        "border border-[#e7dfd5] text-[#1c1917] bg-white hover:bg-[#fbf9f5] hover:border-[#d4af37] focus-visible:ring-[#d4af37]",
      ghost:
        "text-[#1c1917] hover:bg-[#f6efe2] hover:text-[#6b1426]",
      gold:
        "bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-white hover:brightness-105 active:scale-[0.98] shadow-sm",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-6 text-base font-semibold",
      icon: "h-10 w-10 p-0",
    };

    const combinedClassName = cn(
      baseStyles,
      variants[variant],
      sizes[size],
      className
    );

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        className: cn(combinedClassName, child.props.className),
        ...props,
      });
    }

    return (
      <button ref={ref} className={combinedClassName} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
