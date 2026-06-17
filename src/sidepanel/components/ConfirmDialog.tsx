import { Button } from "./Button";

export function ConfirmDialog({
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = true,
  onConfirm,
  onCancel,
}: {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex animate-dmq-fade items-center justify-center bg-stone-900/45 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[320px] animate-dmq-pop rounded-xl bg-surface-card p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-md font-medium text-stone-900">{title}</h3>
        {body && <p className="mt-1.5 text-xs text-stone-500">{body}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
