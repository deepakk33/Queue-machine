import { Minus, Plus } from "lucide-react";

export function Stepper({
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  suffix,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const set = (n: number) => onChange(clamp(n));

  return (
    <div className="inline-flex h-8 items-stretch overflow-hidden rounded-sm border border-stone-200 bg-surface-card">
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => set(value - step)}
        disabled={value <= min}
        className="flex w-8 items-center justify-center text-stone-500 hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus size={14} />
      </button>
      <div className="mono flex min-w-[44px] items-center justify-center border-x border-stone-200 px-1 text-sm text-stone-800">
        {value}
        {suffix ? <span className="ml-0.5 text-2xs text-stone-400">{suffix}</span> : null}
      </div>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => set(value + step)}
        disabled={value >= max}
        className="flex w-8 items-center justify-center text-stone-500 hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
