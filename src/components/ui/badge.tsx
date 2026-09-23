import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gold" | "secondary" | "outline" | "format";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default:
      "bg-[#6b1426]/10 text-[#6b1426] border border-[#6b1426]/20",
    gold:
      "bg-[#fef9ec] text-[#996515] border border-[#dfb15b]",
    secondary:
      "bg-[#f4efe6] text-[#44403c] border border-[#e7dfd5]",
    outline:
      "border border-[#d6cbbe] text-[#57534e]",
    format:
      "bg-[#1c1917] text-[#fef3c7] font-mono text-[10px] tracking-wider uppercase border border-stone-700",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
