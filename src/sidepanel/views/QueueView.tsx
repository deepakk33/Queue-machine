import { useMemo, useState } from "react";
import { ProspectStatus, type Prospect } from "../../shared/types";
import { useQueueStore, countEligible } from "../../store/queue-store";
import { ProspectCard } from "../components/ProspectCard";
import { ConfirmDialog } from "../components/ConfirmDialog";

type Filter = "all" | ProspectStatus;

const FILTERS: Filter[] = [
  "all",
  ProspectStatus.PENDING,
  ProspectStatus.SENT,
  ProspectStatus.FAILED,
  ProspectStatus.SKIPPED,
];

export function QueueView({
  onAdd,
  onEdit,
  onSettings,
  onStart,
}: {
  onAdd: () => void;
  onEdit: (p: Prospect) => void;
  onSettings: () => void;
  onStart: () => void;
}) {
  const prospects = useQueueStore((s) => s.prospects);
  const remove = useQueueStore((s) => s.remove);
  const retry = useQueueStore((s) => s.retry);

  const [filter, setFilter] = useState<Filter>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const eligible = useMemo(
    () => countEligible(prospects, ProspectStatus.PENDING),
    [prospects]
  );

  const visible = useMemo(
    () =>
      filter === "all"
        ? prospects
        : prospects.filter((p) => p.status === filter),
    [prospects, filter]
  );

  return (
    <div className="flex h-full flex-col">
      <header className="space-y-2 border-b border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold">DM Queue</h1>
          <button
            className="text-xs text-gray-500 hover:text-gray-900"
            onClick={onSettings}
            aria-label="Settings"
          >
            ⚙︎ Settings
          </button>
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-xs font-medium hover:bg-gray-50"
            onClick={onAdd}
          >
            + Add Prospect
          </button>
          <button
            className="flex-1 rounded-md bg-blue-600 px-2 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
            onClick={onStart}
            disabled={eligible === 0}
            title={eligible === 0 ? "No pending prospects with a message" : ""}
          >
            Start Sending ({eligible})
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                filter === f
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {visible.length === 0 ? (
          <p className="mt-8 text-center text-xs text-gray-400">
            {prospects.length === 0
              ? "Queue is empty. Add a prospect to begin."
              : "No prospects match this filter."}
          </p>
        ) : (
          visible.map((p) => (
            <ProspectCard
              key={p.id}
              prospect={p}
              onEdit={() => onEdit(p)}
              onDelete={() => setDeleteId(p.id)}
              onRetry={() => retry(p.id)}
            />
          ))
        )}
      </div>

      {deleteId && (
        <ConfirmDialog
          title="Delete prospect?"
          body="This removes the prospect from the queue."
          confirmLabel="Delete"
          onConfirm={() => {
            void remove(deleteId);
            setDeleteId(null);
          }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
