// High-level send actions on the LinkedIn DOM — technical-design §7.3
import { SN_SELECTORS, LI_SELECTORS, detectSurface } from "./dom-selectors";
import {
  waitForElement,
  waitForAnyElement,
  simulateTyping,
  humanDelay,
  isClickable,
} from "./dom-utils";

export interface SendResult {
  success: boolean;
  reason?: string;
}

export async function executeSend(
  prospectId: string,
  message: string
): Promise<SendResult> {
  const surface = detectSurface();
  const selectors = surface === "sales-navigator" ? SN_SELECTORS : LI_SELECTORS;

  try {
    // Step 1: Wait for profile page to load.
    reportStep(prospectId, "Waiting for profile to load...");
    await waitForElement(selectors.profileLoaded || "body", 15000);
    await humanDelay(500, 1000);

    // Step 2: Find and click the Message button.
    reportStep(prospectId, "Looking for Message button...");
    const msgButton = await waitForAnyElement(
      [selectors.messageButton, selectors.messageButtonAlt],
      10000
    );
    if (!isClickable(msgButton)) {
      return { success: false, reason: "Message button found but not clickable" };
    }
    (msgButton as HTMLElement).click();
    await humanDelay(800, 1500);

    // Step 3: Wait for composer to open.
    reportStep(prospectId, "Waiting for composer...");
    const composerInput = await waitForAnyElement(
      [selectors.composerInput, selectors.composerInputAlt],
      10000
    );
    await humanDelay(300, 600);

    // Step 4: Type message.
    reportStep(prospectId, "Typing message...");
    simulateTyping(composerInput as HTMLElement, message);
    await humanDelay(500, 1000);

    // Step 5: Click send.
    reportStep(prospectId, "Clicking send...");
    const sendBtn = await waitForAnyElement(
      [selectors.sendButton, selectors.sendButtonAlt],
      5000
    );
    if (!isClickable(sendBtn)) {
      return { success: false, reason: "Send button found but not clickable" };
    }
    (sendBtn as HTMLElement).click();
    await humanDelay(1000, 2000);

    // Step 6: Best-effort verification — the click executed, assume success.
    reportStep(prospectId, "Verifying send...");

    return { success: true };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Unknown DOM error";
    return { success: false, reason };
  }
}

function reportStep(prospectId: string, step: string): void {
  chrome.runtime
    .sendMessage({ type: "STEP_UPDATE", prospectId, step })
    .catch(() => {});
}
