import { useState } from "react";
import type { Prospect } from "../../shared/types";
import { useQueueStore } from "../../store/queue-store";
import { useSettingsStore } from "../../store/settings-store";
import { renderTemplate } from "../../utils/template";
import { copyToClipboard, readFromClipboard } from "../../utils/clipboard";

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
    // Build a Prospect-shaped object for token rendering.
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

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
        <h2 className="text-sm font-semibold">
          {editing ? "Edit Prospect" : "Add Prospect"}
        </h2>
        <button className="text-xs text-gray-500" onClick={onClose}>
          Cancel
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        <Field label="Name *" value={fields.name} onChange={(v) => set("name", v)} />
        <Field
          label="Profile URL *"
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
          value={fields.companyUrl}
          onChange={(v) => set("companyUrl", v)}
        />
        <Field
          label="Notes"
          value={fields.notes}
          onChange={(v) => set("notes", v)}
          textarea
        />

        <div className="flex gap-2">
          <button
            className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-xs font-medium hover:bg-gray-50"
            onClick={handleCopyContext}
          >
            Copy Context
          </button>
          <button
            className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-xs font-medium hover:bg-gray-50"
            onClick={handlePasteMessage}
          >
            Paste Message
          </button>
        </div>

        <Field
          label="Message"
          value={fields.message}
          onChange={(v) => set("message", v)}
          textarea
          rows={6}
        />
      </div>

      <footer className="border-t border-gray-200 p-3">
        <button
          className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          onClick={handleSave}
          disabled={!canSave}
        >
          Save
        </button>
      </footer>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-700">
        {label}
      </span>
      {textarea ? (
        <textarea
          className="w-full resize-y rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
