import { useEffect, useState } from "react";
import type { Prospect } from "../shared/types";
import { useQueue } from "./hooks/useQueue";
import { useSettings } from "./hooks/useSettings";
import { useSendState } from "./hooks/useSendState";
import { QueueView } from "./views/QueueView";
import { ProspectForm } from "./views/ProspectForm";
import { SendProgress } from "./views/SendProgress";
import { RunSummary } from "./views/RunSummary";
import { SettingsView } from "./views/SettingsView";
import { Toast } from "./components/Toast";

type View = "queue" | "form" | "settings";

export default function App() {
  // Load data stores.
  const queue = useQueue();
  useSettings();
  const send = useSendState();

  const [view, setView] = useState<View>("queue");
  const [editing, setEditing] = useState<Prospect | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Refresh the queue whenever a run completes so statuses are current.
  useEffect(() => {
    if (send.summary) void queue.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [send.summary]);

  // Active run takes over the UI.
  if (send.isActive && send.progress) {
    return (
      <SendProgress
        progress={send.progress}
        onPause={send.pause}
        onResume={send.resume}
        onStop={send.stop}
      />
    );
  }

  // Completed run → summary, until dismissed.
  if (send.summary) {
    return (
      <RunSummary
        summary={send.summary}
        onRetryAll={() => {
          send.retryAllFailed();
          send.clearSummary();
        }}
        onBack={() => {
          send.clearSummary();
          setView("queue");
        }}
      />
    );
  }

  return (
    <>
      {view === "queue" && (
        <QueueView
          onAdd={() => {
            setEditing(null);
            setView("form");
          }}
          onEdit={(p) => {
            setEditing(p);
            setView("form");
          }}
          onSettings={() => setView("settings")}
          onStart={() => send.start()}
        />
      )}

      {view === "form" && (
        <ProspectForm
          editing={editing}
          onClose={() => {
            void queue.load();
            setView("queue");
          }}
          onToast={setToast}
        />
      )}

      {view === "settings" && (
        <SettingsView onClose={() => setView("queue")} onToast={setToast} />
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}
