// Subscribes the side panel to send-engine broadcasts and exposes commands.
// On mount it requests current state (GET_SEND_STATE) so a reopened panel
// reconnects to an in-flight run (AC-25).
import { useEffect } from "react";
import { useSendStateStore } from "../../store/send-state-store";
import type {
  PanelToWorkerMessage,
  WorkerToPanelMessage,
} from "../../shared/messages";

function send(message: PanelToWorkerMessage) {
  chrome.runtime.sendMessage(message).catch(() => {});
}

export function useSendState() {
  const store = useSendStateStore();

  useEffect(() => {
    const listener = (message: WorkerToPanelMessage) => {
      if (message.type === "SEND_STATE_UPDATE") {
        useSendStateStore.getState().setProgress(message.payload);
      } else if (message.type === "SEND_RUN_COMPLETED") {
        useSendStateStore.getState().setSummary(message.payload);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    send({ type: "GET_SEND_STATE" });
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  return {
    progress: store.progress,
    summary: store.summary,
    isActive: store.isActive(),
    clearSummary: store.clearSummary,
    start: () => send({ type: "START_SEND_RUN" }),
    pause: () => send({ type: "PAUSE_SEND_RUN" }),
    resume: () => send({ type: "RESUME_SEND_RUN" }),
    stop: () => send({ type: "STOP_SEND_RUN" }),
    retryProspect: (prospectId: string) =>
      send({ type: "RETRY_PROSPECT", prospectId }),
    retryAllFailed: () => send({ type: "RETRY_ALL_FAILED" }),
  };
}
