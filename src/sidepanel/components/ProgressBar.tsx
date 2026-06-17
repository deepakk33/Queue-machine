export function ProgressBar({
  value,
  max,
  showLabel,
}: {
  value: number;
  max: number;
  showLabel?: boolean;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-sunken">
        <div
          className="h-full rounded-pill bg-accent transition-[width] duration-[280ms] ease-in-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="mono flex justify-between text-2xs text-stone-500">
          <span>
            {value} / {max}
          </span>
          <span>{pct}%</span>
        </div>
      )}
    </div>
  );
}
