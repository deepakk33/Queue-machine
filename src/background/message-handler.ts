// Incoming message router for the service worker.
import { sendEngine } from "./send-engine";
import * as prospectDb from "../db/prospects";
import type { IncomingWorkerMessage } from "../shared/messages";

export function handleMessage(
  message: IncomingWorkerMessage,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void
): boolean {
  switch (message.type) {
    case "START_SEND_RUN":
      void sendEngine.start();
      break;
    case "PAUSE_SEND_RUN":
      sendEngine.pause();
      break;
    case "RESUME_SEND_RUN":
      sendEngine.resume();
      break;
    case "STOP_SEND_RUN":
      sendEngine.stop();
      break;
    case "RETRY_PROSPECT":
      void prospectDb.resetForRetry(message.prospectId).then(() => {
        if (sendEngine.getState() === "idle") void sendEngine.start();
      });
      break;
    case "RETRY_ALL_FAILED":
      void prospectDb.resetAllFailedForRetry().then(() => {
        if (sendEngine.getState() === "idle") void sendEngine.start();
      });
      break;
    case "GET_SEND_STATE":
      sendEngine.broadcastState();
      break;
    case "SEND_SUCCESS":
      void sendEngine.handleSendResult(message.prospectId, true);
      break;
    case "SEND_FAILED":
      void sendEngine.handleSendResult(
        message.prospectId,
        false,
        message.reason
      );
      break;
    case "STEP_UPDATE":
      // Step pings are advisory; forwarded for potential UI use, no-op here.
      break;
  }

  sendResponse({ received: true });
  return true;
}
