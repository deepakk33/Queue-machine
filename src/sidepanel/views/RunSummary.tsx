import { CheckCircle2, XCircle } from "lucide-react";
import type { RunSummary as Summary } from "../../shared/types";
import { Button } from "../components/Button";

function duration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function RunSummary({
  summary,
  onRetryAll,
  onBack,
}: {
  summary: Summary;
  onRetryAll: () => void;
  onBack: () => void;
}) {
  const hasFailures = summary.failedItems.length > 0;

  return (
    <div className="flex h-full flex-col bg-app">
      <header className="border-b border-stone-200 px-3.5 py-2.5">
        <h2 className="font-display text-lg font-medium text-stone-900">
          Run summary
        </h2>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-3.5 py-4">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={26} />
          </div>
          <p className="mt-2 font-display text-xl font-medium text-stone-900">
            Run complete
          </p>
          <p className="mono mt-1 text-xs text-stone-500">
            {summary.totalProcessed} processed ·{" "}
            {duration(summary.completedAt - summary.startedAt)}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label="sent" value={summary.sentCount} color="text-emerald-700" />
          <Stat label="failed" value={summary.failedCount} color="text-red-700" />
          <Stat label="skipped" value={summary.skippedCount} color="text-amber-700" />
        </div>

        {hasFailures && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-caps text-stone-400">
              Needs attention
            </p>
            <ul className="space-y-1.5">
              {summary.failedItems.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-2 rounded-md border border-stone-200 bg-surface-card p-2.5"
                >
                  <span className="mt-0.5 shrink-0 text-red-500">
                    <XCircle size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-red-600">{item.reason}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <footer className="flex gap-2 border-t border-stone-200 px-3.5 py-3">
        <Button variant="secondary" size="lg" fullWidth onClick={onBack}>
          Back to queue
        </Button>
        {hasFailures && (
          <Button size="lg" fullWidth onClick={onRetryAll}>
            Retry all failed
          </Button>
        )}
      </footer>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-md bg-surface-sunken py-2.5 text-center">
      <div className={`mono text-2xl font-semibold ${color}`}>{value}</div>
      <div className="text-2xs text-stone-500">{label}</div>
    </div>
  );
}
