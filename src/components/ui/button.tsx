import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  children: ReactNode;
};

const variants = {
  primary: "bg-police text-white shadow-sm hover:bg-navy",
  secondary: "bg-white text-police shadow-sm hover:bg-slate-100",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  outline: "border border-white/80 bg-transparent text-white hover:bg-white/10",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

export function Button({ asChild, className, variant = "primary", ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-action/30 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
