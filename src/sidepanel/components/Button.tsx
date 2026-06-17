import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-fg hover:bg-accent-hover active:bg-accent-active disabled:bg-stone-300 disabled:text-stone-0",
  secondary:
    "bg-surface-card text-stone-700 border border-stone-200 hover:bg-surface-hover active:bg-surface-active",
  ghost: "bg-transparent text-stone-600 hover:bg-surface-hover active:bg-surface-active",
  danger: "bg-red-600 text-stone-0 hover:bg-red-700",
  "danger-ghost":
    "bg-transparent text-red-600 border border-red-100 hover:bg-red-50",
};

const SIZES: Record<Size, string> = {
  sm: "h-7 px-2.5 text-xs",
  md: "h-[34px] px-3 text-sm",
  lg: "h-10 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  icon,
  iconTrailing,
  children,
  className = "",
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconTrailing?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex select-none items-center justify-center gap-1.5 rounded-sm font-medium transition-[background,transform,color] duration-[120ms] ease-out active:scale-[0.98] focus:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed ${
        fullWidth ? "w-full" : ""
      } ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
      {iconTrailing}
    </button>
  );
}
