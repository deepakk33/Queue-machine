// Message types for chrome.runtime communication — technical-design §4.2
import type { SendProgress, RunSummary, ProspectStatus } from "./types";

// Side Panel → Service Worker
export type PanelToWorkerMessage =
  | { type: "START_SEND_RUN" }
  | { type: "PAUSE_SEND_RUN" }
  | { type: "RESUME_SEND_RUN" }
  | { type: "STOP_SEND_RUN" }
  | { type: "RETRY_PROSPECT"; prospectId: string }
  | { type: "RETRY_ALL_FAILED" }
  | { type: "GET_SEND_STATE" };

// Service Worker → Side Panel
export type WorkerToPanelMessage =
  | { type: "SEND_STATE_UPDATE"; payload: SendProgress }
  | { type: "SEND_RUN_COMPLETED"; payload: RunSummary }
  | { type: "PROSPECT_STATUS_CHANGED"; prospectId: string; status: ProspectStatus };

// Service Worker → Content Script
export type WorkerToContentMessage = {
  type: "EXECUTE_SEND";
  prospectId: string;
  message: string;
};

// Content Script → Service Worker
export type ContentToWorkerMessage =
  | { type: "SEND_SUCCESS"; prospectId: string }
  | { type: "SEND_FAILED"; prospectId: string; reason: string }
  | { type: "STEP_UPDATE"; prospectId: string; step: string };

// Union of everything the service worker may receive
export type IncomingWorkerMessage =
  | PanelToWorkerMessage
  | ContentToWorkerMessage;
