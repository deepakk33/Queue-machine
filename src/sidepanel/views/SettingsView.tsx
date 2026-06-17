import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useSettingsStore } from "../../store/settings-store";
import { useQueueStore } from "../../store/queue-store";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { IconButton } from "../components/IconButton";
import { Button } from "../components/Button";
import { Switch } from "../components/Switch";
import { Stepper } from "../components/Stepper";

const TOKENS = [
  "{{name}}",
  "{{designation}}",
  "{{company}}",
  "{{companyUrl}}",
  "{{profileUrl}}",
  "{{notes}}",
];

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

  return (
    <div className="flex h-full flex-col bg-app">
      <header className="flex items-center gap-2 border-b border-stone-200 px-3.5 py-2.5">
        <IconButton label="Back" onClick={onClose}>
          <ArrowLeft size={17} />
        </IconButton>
        <h2 className="font-display text-lg font-medium text-stone-900">Settings</h2>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-3.5 py-4">
        <Section title="Send pacing">
          <Row label="Min delay" description="Shortest wait between sends.">
            <Stepper
              value={settings.minDelay}
              min={5}
              max={settings.maxDelay}
              step={5}
              suffix="s"
              onChange={(v) => save({ minDelay: v })}
            />
          </Row>
          <Row label="Max delay" description="Longest wait between sends.">
            <Stepper
              value={settings.maxDelay}
              min={settings.minDelay}
              step={5}
              suffix="s"
              onChange={(v) => save({ maxDelay: v })}
            />
          </Row>
        </Section>

        <Section title="Retries">
          <Row label="Auto-retry" description="Retry failed sends automatically.">
            <Switch
              label="Auto-retry"
              checked={settings.autoRetry}
              onChange={(v) => save({ autoRetry: v })}
            />
          </Row>
          <Row label="Max retries" description="Attempts before giving up.">
            <Stepper
              value={settings.maxRetries}
              min={0}
              max={5}
              onChange={(v) => save({ maxRetries: v })}
            />
          </Row>
        </Section>

        <Section title="Prompt template">
          <textarea
            className="w-full resize-y rounded-sm border border-stone-200 bg-surface-card px-2.5 py-2 text-xs text-stone-800 focus:border-accent focus:outline-none focus:shadow-focus"
            rows={9}
            value={settings.promptTemplate}
            onChange={(e) => save({ promptTemplate: e.target.value })}
          />
          <div className="flex flex-wrap gap-1.5">
            {TOKENS.map((t) => (
              <span
                key={t}
                className="mono rounded-xs bg-surface-sunken px-1.5 py-0.5 text-2xs text-stone-500"
              >
                {t}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Danger zone">
          <div className="rounded-md border border-red-100 bg-red-50 p-3">
            <p className="text-xs text-stone-600">
              Permanently delete every prospect in the queue.
            </p>
            <Button
              variant="danger-ghost"
              size="sm"
              className="mt-2"
              onClick={() => setConfirmClear(true)}
            >
              Clear all data
            </Button>
          </div>
        </Section>
      </div>

      {confirmClear && (
        <ConfirmDialog
          title="Clear all data?"
          body="This permanently deletes every prospect in the queue and cannot be undone."
          confirmLabel="Clear all"
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs font-semibold uppercase tracking-caps text-stone-400">
        {title}
      </p>
      {children}
    </div>
  );
}

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-stone-700">{label}</p>
        <p className="text-2xs text-stone-400">{description}</p>
      </div>
      {children}
    </div>
  );
}
