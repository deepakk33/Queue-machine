import type { RunSummary as Summary } from "../../shared/types";

export function RunSummary({
  summary,
  onRetryAll,
  onBack,
}: {
  summary: Summary;
  onRetryAll: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-gray-200 p-3">
        <h2 className="text-sm font-semibold">Run Summary</h2>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <Stat label="Sent" value={summary.sentCount} color="text-green-700" />
          <Stat label="Failed" value={summary.failedCount} color="text-red-700" />
          <Stat
            label="Skipped"
            value={summary.skippedCount}
            color="text-amber-700"
          />
        </div>

        {summary.failedItems.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-medium text-gray-500">
              Failed / Skipped
            </p>
            <ul className="space-y-1">
              {summary.failedItems.map((item) => (
                <li
                  key={item.id}
                  className="rounded-md border border-gray-200 p-2 text-xs"
                >
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="block text-red-600">{item.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <footer className="space-y-2 border-t border-gray-200 p-3">
        {summary.failedItems.length > 0 && (
          <button
            className="w-full rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600"
            onClick={onRetryAll}
          >
            Retry All Failed
          </button>
        )}
        <button
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
          onClick={onBack}
        >
          Back to Queue
        </button>
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
    <div className="rounded-md bg-gray-50 py-2">
      <div className={`text-base font-semibold ${color}`}>{value}</div>
      <div className="text-gray-500">{label}</div>
    </div>
  );
}
