import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "ghost" | "solid" | "accent" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  ghost: "text-stone-500 hover:bg-surface-hover hover:text-stone-700",
  solid: "bg-surface-sunken text-stone-700 hover:bg-surface-active",
  accent: "text-accent hover:bg-accent-weak",
  danger: "text-red-600 hover:bg-red-50",
};

const SIZES: Record<Size, string> = {
  sm: "h-[26px] w-[26px]",
  md: "h-8 w-8",
};

export function IconButton({
  variant = "ghost",
  size = "md",
  label,
  children,
  className = "",
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  label: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-sm transition-[background,color,transform] duration-[120ms] ease-out active:scale-[0.92] focus:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
