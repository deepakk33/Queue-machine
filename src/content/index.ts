// Content script entry — technical-design §7.4
import { executeSend } from "./dom-actions";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "EXECUTE_SEND") {
    executeSend(message.prospectId, message.message).then((result) => {
      chrome.runtime
        .sendMessage({
          type: result.success ? "SEND_SUCCESS" : "SEND_FAILED",
          prospectId: message.prospectId,
          reason: result.reason,
        })
        .catch(() => {});
    });
    sendResponse({ received: true });
  }
  return true;
});
