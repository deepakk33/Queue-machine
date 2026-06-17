import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { IconButton } from "./IconButton";
import { ProspectStatus, type Prospect } from "../../shared/types";

export function ProspectCard({
  prospect,
  onEdit,
  onDelete,
  onRetry,
}: {
  prospect: Prospect;
  onEdit: () => void;
  onDelete: () => void;
  onRetry: () => void;
}) {
  const hasMessage = prospect.message.trim().length > 0;
  const canRetry =
    prospect.status === ProspectStatus.FAILED ||
    prospect.status === ProspectStatus.SKIPPED;
  const subtitle = [prospect.designation, prospect.company]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="group rounded-lg border border-stone-200 bg-surface-card p-3 transition-[box-shadow,border-color] duration-[120ms] hover:border-stone-300 hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-md font-medium text-stone-900">
            {prospect.name || "(no name)"}
          </p>
          {subtitle && (
            <p className="truncate text-xs text-stone-500">{subtitle}</p>
          )}
        </div>
        <StatusBadge status={prospect.status} />
      </div>

      <p
        className={`mt-2 line-clamp-2 text-xs ${
          hasMessage ? "text-stone-600" : "italic text-stone-400"
        }`}
      >
        {hasMessage ? prospect.message : "no message yet"}
      </p>

      {prospect.failureReason && (
        <p className="mt-1.5 text-xs text-red-600">{prospect.failureReason}</p>
      )}

      <div className="mt-2 flex justify-end gap-1 opacity-0 transition-opacity duration-[120ms] group-hover:opacity-100 focus-within:opacity-100">
        {canRetry && (
          <IconButton variant="accent" size="sm" label="Retry" onClick={onRetry}>
            <RotateCcw size={14} />
          </IconButton>
        )}
        <IconButton variant="ghost" size="sm" label="Edit" onClick={onEdit}>
          <Pencil size={14} />
        </IconButton>
        <IconButton variant="danger" size="sm" label="Delete" onClick={onDelete}>
          <Trash2 size={14} />
        </IconButton>
      </div>
    </div>
  );
}
