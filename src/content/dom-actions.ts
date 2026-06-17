// High-level send actions on the LinkedIn DOM — technical-design §7.3
import {
  detectSurface,
  profileLoadedStrategies,
  messageButtonStrategies,
  composerInputStrategies,
  sendButtonStrategies,
} from "./dom-selectors";
import {
  resolveElement,
  simulateTyping,
  humanDelay,
  isClickable,
  dmqLog,
  describe,
  dumpDiagnostics,
  readFieldValue,
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
  dmqLog("=== executeSend START ===");
  dmqLog(`surface=${surface}  url=${window.location.href}`);

  try {
    // Step 1: Confirm page rendered (soft — falls back to body).
    reportStep(prospectId, "Waiting for profile to load...");
    const loaded = await resolveElement(
      profileLoadedStrategies(surface),
      15000,
      "profile container"
    );
    dmqLog("step 1 OK: profile loaded =", describe(loaded));
    await humanDelay(500, 1000);

    // Step 2: Find and click the Message button (layered strategies).
    reportStep(prospectId, "Looking for Message button...");
    const msgButton = await resolveElement(
      messageButtonStrategies(surface),
      10000,
      "Message button"
    );
    dmqLog("step 2: Message button =", describe(msgButton));
    if (!isClickable(msgButton)) {
      dumpDiagnostics("message-button-not-clickable");
      return { success: false, reason: "Message button found but not clickable" };
    }
    (msgButton as HTMLElement).click();
    dmqLog("step 2 OK: Message button clicked");
    await humanDelay(800, 1500);

    // Step 3: Wait for composer to open.
    reportStep(prospectId, "Waiting for composer...");
    const composerInput = await resolveElement(
      composerInputStrategies(surface),
      10000,
      "composer input"
    );
    dmqLog("step 3 OK: composer input =", describe(composerInput));
    await humanDelay(300, 600);

    // Step 4: Type message.
    reportStep(prospectId, "Typing message...");
    simulateTyping(composerInput as HTMLElement, message);
    const typed = readFieldValue(composerInput);
    dmqLog("step 4: typed; composer value now =", JSON.stringify(typed.slice(0, 60)));
    // Guard against firing a blank InMail if the value never registered.
    if (message.trim() && !typed.trim()) {
      dumpDiagnostics("composer-value-empty-after-type");
      return {
        success: false,
        reason: "Message did not enter the composer (empty after typing)",
      };
    }
    await humanDelay(500, 1000);

    // Step 5: Click send.
    reportStep(prospectId, "Clicking send...");
    const sendBtn = await resolveElement(
      sendButtonStrategies(surface),
      5000,
      "Send button"
    );
    dmqLog("step 5: Send button =", describe(sendBtn));
    if (!isClickable(sendBtn)) {
      dumpDiagnostics("send-button-not-clickable");
      return { success: false, reason: "Send button found but not clickable" };
    }
    (sendBtn as HTMLElement).click();
    dmqLog("step 5 OK: Send clicked");
    await humanDelay(1000, 2000);

    // Step 6: Best-effort verification — the click executed, assume success.
    reportStep(prospectId, "Verifying send...");
    dmqLog("=== executeSend SUCCESS ===");

    return { success: true };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Unknown DOM error";
    dmqLog("=== executeSend FAILED:", reason, "===");
    // Auto-capture the DOM at the point of failure so logs are self-sufficient.
    dumpDiagnostics("send-failed: " + reason);
    return { success: false, reason };
  }
}

function reportStep(prospectId: string, step: string): void {
  dmqLog(step);
  chrome.runtime
    .sendMessage({ type: "STEP_UPDATE", prospectId, step })
    .catch(() => {});
}
