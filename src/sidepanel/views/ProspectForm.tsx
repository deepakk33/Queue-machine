import { useState } from "react";
import { ArrowLeft, ClipboardPaste, Copy, Link2 } from "lucide-react";
import type { ReactNode } from "react";
import type { Prospect } from "../../shared/types";
import { useQueueStore } from "../../store/queue-store";
import { useSettingsStore } from "../../store/settings-store";
import { renderTemplate } from "../../utils/template";
import { copyToClipboard, readFromClipboard } from "../../utils/clipboard";
import { IconButton } from "../components/IconButton";
import { Button } from "../components/Button";

type FormFields = Pick<
  Prospect,
  | "name"
  | "profileUrl"
  | "designation"
  | "company"
  | "companyUrl"
  | "notes"
  | "message"
>;

const EMPTY: FormFields = {
  name: "",
  profileUrl: "",
  designation: "",
  company: "",
  companyUrl: "",
  notes: "",
  message: "",
};

const MAX_MESSAGE = 500;

export function ProspectForm({
  editing,
  onClose,
  onToast,
}: {
  editing: Prospect | null;
  onClose: () => void;
  onToast: (msg: string) => void;
}) {
  const add = useQueueStore((s) => s.add);
  const update = useQueueStore((s) => s.update);
  const promptTemplate = useSettingsStore((s) => s.settings.promptTemplate);

  const [fields, setFields] = useState<FormFields>(
    editing
      ? {
          name: editing.name,
          profileUrl: editing.profileUrl,
          designation: editing.designation,
          company: editing.company,
          companyUrl: editing.companyUrl,
          notes: editing.notes,
          message: editing.message,
        }
      : EMPTY
  );

  const set = (k: keyof FormFields, v: string) =>
    setFields((f) => ({ ...f, [k]: v }));

  const canSave = fields.name.trim() && fields.profileUrl.trim();

  const handleSave = async () => {
    if (!canSave) return;
    if (editing) {
      await update(editing.id, fields);
    } else {
      await add(fields);
    }
    onClose();
  };

  const handleCopyContext = async () => {
    const stub: Prospect = {
      ...EMPTY,
      ...fields,
      id: editing?.id ?? "",
      status: editing?.status ?? ("pending" as Prospect["status"]),
      failureReason: "",
      retryCount: 0,
      lastAttemptAt: null,
      sentAt: null,
      createdAt: 0,
      order: 0,
    };
    const ok = await copyToClipboard(renderTemplate(promptTemplate, stub));
    onToast(ok ? "Context copied to clipboard" : "Copy failed");
  };

  const handlePasteMessage = async () => {
    const text = await readFromClipboard();
    if (text === null) {
      onToast("Clipboard read failed");
      return;
    }
    set("message", text);
    onToast("Message pasted");
  };

  const over = fields.message.length > MAX_MESSAGE;

  return (
    <div className="flex h-full flex-col bg-app">
      <header className="flex items-center gap-2 border-b border-stone-200 px-3.5 py-2.5">
        <IconButton label="Back" onClick={onClose}>
          <ArrowLeft size={17} />
        </IconButton>
        <h2 className="font-display text-lg font-medium text-stone-900">
          {editing ? "Edit prospect" : "Add prospect"}
        </h2>
      </header>

      <div className="flex-1 space-y-3.5 overflow-y-auto px-3.5 py-3.5">
        <Field label="Name" required value={fields.name} onChange={(v) => set("name", v)} />
        <Field
          label="Profile URL"
          required
          mono
          icon={<Link2 size={14} />}
          placeholder="linkedin.com/sales/lead/…"
          value={fields.profileUrl}
          onChange={(v) => set("profileUrl", v)}
        />
        <Field
          label="Designation"
          value={fields.designation}
          onChange={(v) => set("designation", v)}
        />
        <Field
          label="Company"
          value={fields.company}
          onChange={(v) => set("company", v)}
        />
        <Field
          label="Company URL"
          mono
          icon={<Link2 size={14} />}
          value={fields.companyUrl}
          onChange={(v) => set("companyUrl", v)}
        />
        <Field
          label="Notes"
          hint="Context for the AI prompt."
          value={fields.notes}
          onChange={(v) => set("notes", v)}
          textarea
        />

        <div className="border-t border-stone-100 pt-3.5">
          <p className="text-xs font-semibold uppercase tracking-caps text-stone-400">
            Compose message
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              icon={<Copy size={14} />}
              onClick={handleCopyContext}
            >
              Copy context
            </Button>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              icon={<ClipboardPaste size={14} />}
              onClick={handlePasteMessage}
            >
              Paste message
            </Button>
          </div>

          <label className="mt-3 block">
            <span className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-stone-700">Message</span>
              <span className={`mono text-2xs ${over ? "text-red-600" : "text-stone-400"}`}>
                {fields.message.length} / {MAX_MESSAGE}
              </span>
            </span>
            <textarea
              className={`w-full resize-y rounded-sm border bg-surface-card px-2.5 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:shadow-focus ${
                over ? "border-red-500" : "border-stone-200 focus:border-accent"
              }`}
              rows={6}
              value={fields.message}
              placeholder="Paste or write the InMail to send…"
              onChange={(e) => set("message", e.target.value)}
            />
          </label>
        </div>
      </div>

      <footer className="flex gap-2 border-t border-stone-200 px-3.5 py-3">
        <Button variant="ghost" size="lg" fullWidth onClick={onClose}>
          Cancel
        </Button>
        <Button size="lg" fullWidth onClick={handleSave} disabled={!canSave}>
          Save prospect
        </Button>
      </footer>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  required,
  mono,
  icon,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  required?: boolean;
  mono?: boolean;
  icon?: ReactNode;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-stone-700">
        {label}
        {required && <span className="ml-0.5 text-accent">*</span>}
      </span>
      {textarea ? (
        <textarea
          className="w-full resize-y rounded-sm border border-stone-200 bg-surface-card px-2.5 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-accent focus:outline-none focus:shadow-focus"
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="flex items-center gap-2 rounded-sm border border-stone-200 bg-surface-card px-2.5 focus-within:border-accent focus-within:shadow-focus">
          {icon && <span className="text-stone-400">{icon}</span>}
          <input
            className={`h-[34px] w-full bg-transparent text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none ${
              mono ? "mono" : ""
            }`}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}
      {hint && <span className="mt-1 block text-2xs text-stone-400">{hint}</span>}
    </label>
  );
}
