import { useMemo, useState } from "react";
import { Plus, Play, Settings } from "lucide-react";
import { ProspectStatus, type Prospect } from "../../shared/types";
import { useQueueStore, countEligible } from "../../store/queue-store";
import { ProspectCard } from "../components/ProspectCard";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { IconButton } from "../components/IconButton";
import { Button } from "../components/Button";
import { Wordmark } from "../components/Wordmark";

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
    <div className="flex h-full flex-col bg-app">
      <header className="flex items-center justify-between border-b border-stone-200 px-3.5 py-2.5">
        <Wordmark />
        <div className="flex items-center gap-0.5">
          <IconButton label="Settings" onClick={onSettings}>
            <Settings size={17} />
          </IconButton>
          <IconButton variant="accent" label="Add prospect" onClick={onAdd}>
            <Plus size={18} />
          </IconButton>
        </div>
      </header>

      <div className="flex flex-wrap gap-1.5 border-b border-stone-100 px-3.5 py-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-pill px-2.5 py-1 text-xs capitalize transition-colors duration-[120ms] ${
              filter === f
                ? "bg-stone-900 text-stone-0"
                : "bg-surface-sunken text-stone-600 hover:bg-surface-active"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3.5 py-3">
        {visible.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="text-sm text-stone-500">
              {prospects.length === 0 ? "Queue is empty" : "Nothing here"}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              {prospects.length === 0
                ? "Add a prospect to begin."
                : "No prospects match this filter."}
            </p>
          </div>
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

      <footer className="border-t border-stone-200 px-3.5 py-3">
        <Button
          fullWidth
          size="lg"
          icon={<Play size={15} />}
          onClick={onStart}
          disabled={eligible === 0}
          title={eligible === 0 ? "No pending prospects with a message" : ""}
        >
          Start sending
          <span className="mono ml-1 opacity-80">· {eligible} ready</span>
        </Button>
      </footer>

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
