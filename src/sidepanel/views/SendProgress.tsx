import { Pause, Play, Square } from "lucide-react";
import {
  ProspectStatus,
  SendEngineState,
  type LogEntry,
  type SendProgress as Progress,
} from "../../shared/types";
import { ProgressBar } from "../components/ProgressBar";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/Button";

const LOG_COLORS: Record<LogEntry["type"], string> = {
  info: "text-stone-500",
  success: "text-emerald-600",
  error: "text-red-600",
  warning: "text-amber-600",
};

function clock(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function SendProgress({
  progress,
  onPause,
  onResume,
  onStop,
}: {
  progress: Progress;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}) {
  const paused = progress.engineState === SendEngineState.PAUSED;
  const waiting = progress.engineState === SendEngineState.WAITING;
  const done = progress.sentCount + progress.skippedCount;

  return (
    <div className="flex h-full flex-col bg-app">
      <header className="flex items-center justify-between border-b border-stone-200 px-3.5 py-2.5">
        <h2 className="font-display text-lg font-medium text-stone-900">
          {paused ? "Paused" : "Sending"}
        </h2>
        <StatusBadge
          status={paused ? ProspectStatus.PENDING : ProspectStatus.SENDING}
        />
      </header>

      <div className="space-y-3 px-3.5 py-3.5">
        <div className="flex items-end justify-between">
          <div className="mono text-2xl font-medium text-stone-900">
            {progress.currentIndex}
            <span className="text-stone-400"> / {progress.totalCount}</span>
          </div>
          <span className="text-xs text-stone-500">in this run</span>
        </div>
        <ProgressBar value={done} max={progress.totalCount} showLabel />

        <div className="rounded-lg border border-stone-200 bg-surface-card p-3">
          <p className="text-xs font-semibold uppercase tracking-caps text-stone-400">
            {waiting ? "Waiting" : "Now sending"}
          </p>
          {waiting ? (
            <p className="mono mt-1 text-md text-sky-700">
              next in {progress.waitingSecondsRemaining}s
            </p>
          ) : (
            <p className="mt-1 truncate text-md font-medium text-stone-900">
              {progress.currentProspectName ?? "—"}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label="sent" value={progress.sentCount} color="text-emerald-700" />
          <Stat label="failed" value={progress.failedCount} color="text-red-700" />
          <Stat label="skipped" value={progress.skippedCount} color="text-amber-700" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto border-t border-stone-100 px-3.5 py-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-caps text-stone-400">
          Activity
        </p>
        <ul className="space-y-1.5">
          {[...progress.log].reverse().map((entry, i) => (
            <li key={i} className="flex gap-2 text-xs">
              <span className="mono shrink-0 text-2xs text-stone-400">
                {clock(entry.timestamp)}
              </span>
              <span className={LOG_COLORS[entry.type]}>{entry.message}</span>
            </li>
          ))}
        </ul>
      </div>

      <footer className="flex gap-2 border-t border-stone-200 px-3.5 py-3">
        {paused ? (
          <Button size="lg" fullWidth icon={<Play size={15} />} onClick={onResume}>
            Resume
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            icon={<Pause size={15} />}
            onClick={onPause}
          >
            Pause
          </Button>
        )}
        <Button
          variant="danger-ghost"
          size="lg"
          fullWidth
          icon={<Square size={14} />}
          onClick={onStop}
        >
          Stop
        </Button>
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
    <div className="rounded-md bg-surface-sunken py-2 text-center">
      <div className={`mono text-lg font-semibold ${color}`}>{value}</div>
      <div className="text-2xs text-stone-500">{label}</div>
    </div>
  );
}
