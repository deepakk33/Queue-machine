import { STATUS_COLORS } from "../../shared/constants";
import type { ProspectStatus } from "../../shared/types";

export function StatusBadge({
  status,
  count,
}: {
  status: ProspectStatus;
  count?: number;
}) {
  const c = STATUS_COLORS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-2 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}
    >
      <span
        className={`h-[7px] w-[7px] shrink-0 rounded-pill ${c.dot} ${
          status === "sending" ? "animate-dmq-pulse" : ""
        }`}
      />
      {c.label}
      {count !== undefined && <span className="mono opacity-80">{count}</span>}
    </span>
  );
}
