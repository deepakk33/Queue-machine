import { STATUS_COLORS } from "../../shared/constants";
import type { ProspectStatus } from "../../shared/types";

export function StatusBadge({ status }: { status: ProspectStatus }) {
  const c = STATUS_COLORS[status];
  const pulse = status === "sending" ? "animate-pulse" : "";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.bg} ${c.text} ${pulse}`}
    >
      {c.label}
    </span>
  );
}
