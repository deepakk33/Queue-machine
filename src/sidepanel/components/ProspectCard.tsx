import { StatusBadge } from "./StatusBadge";
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

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">
            {prospect.name || "(no name)"}
          </p>
          {prospect.company && (
            <p className="truncate text-xs text-gray-500">{prospect.company}</p>
          )}
        </div>
        <StatusBadge status={prospect.status} />
      </div>

      <p
        className={`mt-2 line-clamp-2 text-xs ${
          hasMessage ? "text-gray-600" : "italic text-gray-400"
        }`}
      >
        {hasMessage ? prospect.message : "No message"}
      </p>

      {prospect.failureReason && (
        <p className="mt-1 text-xs text-red-600">{prospect.failureReason}</p>
      )}

      <div className="mt-2 flex gap-3 text-xs">
        <button className="text-blue-600 hover:underline" onClick={onEdit}>
          Edit
        </button>
        {canRetry && (
          <button className="text-amber-600 hover:underline" onClick={onRetry}>
            Retry
          </button>
        )}
        <button className="text-red-600 hover:underline" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
