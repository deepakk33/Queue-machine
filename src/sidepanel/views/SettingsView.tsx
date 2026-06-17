import { useState } from "react";
import { useSettingsStore } from "../../store/settings-store";
import { useQueueStore } from "../../store/queue-store";
import { ConfirmDialog } from "../components/ConfirmDialog";

export function SettingsView({
  onClose,
  onToast,
}: {
  onClose: () => void;
  onToast: (msg: string) => void;
}) {
  const settings = useSettingsStore((s) => s.settings);
  const save = useSettingsStore((s) => s.save);
  const clearAll = useQueueStore((s) => s.clearAll);

  const [confirmClear, setConfirmClear] = useState(false);

  const num = (v: string, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
        <h2 className="text-sm font-semibold">Settings</h2>
        <button className="text-xs text-gray-500" onClick={onClose}>
          Done
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          <NumField
            label="Min delay (s)"
            value={settings.minDelay}
            onChange={(v) => save({ minDelay: num(v, settings.minDelay) })}
          />
          <NumField
            label="Max delay (s)"
            value={settings.maxDelay}
            onChange={(v) => save({ maxDelay: num(v, settings.maxDelay) })}
          />
        </div>

        <NumField
          label="Max retries (0 = none)"
          value={settings.maxRetries}
          onChange={(v) => save({ maxRetries: num(v, settings.maxRetries) })}
        />

        <label className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">Auto-retry</span>
          <input
            type="checkbox"
            checked={settings.autoRetry}
            onChange={(e) => save({ autoRetry: e.target.checked })}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-700">
            Prompt template
          </span>
          <textarea
            className="w-full resize-y rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
            rows={10}
            value={settings.promptTemplate}
            onChange={(e) => save({ promptTemplate: e.target.value })}
          />
          <span className="mt-1 block text-xs text-gray-400">
            Tokens: {"{{name}}"} {"{{designation}}"} {"{{company}}"}{" "}
            {"{{companyUrl}}"} {"{{profileUrl}}"} {"{{notes}}"}
          </span>
        </label>
      </div>

      <footer className="border-t border-gray-200 p-3">
        <button
          className="w-full rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          onClick={() => setConfirmClear(true)}
        >
          Clear All Data
        </button>
      </footer>

      {confirmClear && (
        <ConfirmDialog
          title="Clear all prospects?"
          body="This permanently deletes every prospect in the queue."
          confirmLabel="Clear All"
          onConfirm={() => {
            void clearAll().then(() => onToast("Queue cleared"));
            setConfirmClear(false);
          }}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-700">
        {label}
      </span>
      <input
        type="number"
        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
