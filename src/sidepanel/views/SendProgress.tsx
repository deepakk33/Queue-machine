import { SendEngineState, type SendProgress as Progress } from "../../shared/types";
import { ProgressBar } from "../components/ProgressBar";

const LOG_COLORS: Record<string, string> = {
  info: "text-gray-600",
  success: "text-green-700",
  error: "text-red-700",
  warning: "text-amber-700",
};

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
    <div className="flex h-full flex-col">
      <header className="border-b border-gray-200 p-3">
        <h2 className="text-sm font-semibold">Sending</h2>
        <p className="mt-1 text-xs text-gray-500">
          {progress.currentIndex} of {progress.totalCount}
          {progress.currentProspectName
            ? ` · ${progress.currentProspectName}`
            : ""}
        </p>
      </header>

      <div className="space-y-3 p-3">
        <ProgressBar value={done} max={progress.totalCount} />

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <Stat label="Sent" value={progress.sentCount} color="text-green-700" />
          <Stat label="Failed" value={progress.failedCount} color="text-red-700" />
          <Stat
            label="Skipped"
            value={progress.skippedCount}
            color="text-amber-700"
          />
        </div>

        {waiting && (
          <p className="text-center text-xs text-blue-600">
            Waiting {progress.waitingSecondsRemaining}s before next send…
          </p>
        )}

        <div className="flex gap-2">
          {paused ? (
            <button
              className="flex-1 rounded-md bg-blue-600 px-2 py-1.5 text-xs font-medium text-white"
              onClick={onResume}
            >
              Resume
            </button>
          ) : (
            <button
              className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-xs font-medium hover:bg-gray-50"
              onClick={onPause}
            >
              Pause
            </button>
          )}
          <button
            className="flex-1 rounded-md border border-red-300 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            onClick={onStop}
          >
            Stop
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto border-t border-gray-200 p-3">
        <p className="mb-1 text-xs font-medium text-gray-500">Activity</p>
        <ul className="space-y-1">
          {[...progress.log].reverse().map((entry, i) => (
            <li key={i} className={`text-xs ${LOG_COLORS[entry.type]}`}>
              {entry.message}
            </li>
          ))}
        </ul>
      </div>
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
