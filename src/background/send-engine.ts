// Core send-loop state machine — technical-design §6.2 (with wiring fixes).
import { SendEngineState, ProspectStatus } from "../shared/types";
import type {
  Prospect,
  SendProgress,
  RunSummary,
  LogEntry,
} from "../shared/types";
import * as prospectDb from "../db/prospects";
import { getSettings } from "../db/settings";
import { navigateAndWait } from "./tab-manager";

const KEEP_ALIVE_ALARM = "keepAlive";

class SendEngine {
  private state: SendEngineState = SendEngineState.IDLE;
  private queue: Prospect[] = [];
  private currentIndex = 0;
  private sentCount = 0;
  private failedCount = 0;
  private skippedCount = 0;
  private log: LogEntry[] = [];
  private startedAt = 0;
  private delayTimer: ReturnType<typeof setTimeout> | null = null;
  private waitingSecondsRemaining = 0;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  // Called by message handler when side panel sends START_SEND_RUN
  async start(): Promise<void> {
    if (this.state !== SendEngineState.IDLE) return;

    this.queue = await prospectDb.getPendingWithMessage();
    if (this.queue.length === 0) return;

    this.currentIndex = 0;
    this.sentCount = 0;
    this.failedCount = 0;
    this.skippedCount = 0;
    this.log = [];
    this.startedAt = Date.now();

    this.ensureKeepAlive();
    this.setState(SendEngineState.RUNNING);
    this.addLog("Send run started", "info");
    this.processNext();
  }

  pause(): void {
    if (this.state === SendEngineState.WAITING) {
      // Clear the delay timer — pause takes effect immediately during a wait.
      if (this.delayTimer) clearTimeout(this.delayTimer);
      if (this.countdownInterval) clearInterval(this.countdownInterval);
      this.delayTimer = null;
      this.countdownInterval = null;
    }
    this.setState(SendEngineState.PAUSED);
    this.addLog("Paused by user", "warning");
  }

  resume(): void {
    if (this.state !== SendEngineState.PAUSED) return;
    this.ensureKeepAlive();
    this.setState(SendEngineState.RUNNING);
    this.addLog("Resumed", "info");
    this.processNext();
  }

  stop(): void {
    if (this.delayTimer) clearTimeout(this.delayTimer);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.delayTimer = null;
    this.countdownInterval = null;
    this.setState(SendEngineState.IDLE);
    this.addLog("Stopped by user", "warning");
    chrome.alarms.clear(KEEP_ALIVE_ALARM);
  }

  // Called via message handler when the content script reports a send result.
  async handleSendResult(
    prospectId: string,
    success: boolean,
    reason?: string
  ): Promise<void> {
    const prospect = this.queue[this.currentIndex];
    if (!prospect || prospect.id !== prospectId) return;

    if (success) {
      await prospectDb.markSent(prospectId);
      this.sentCount++;
      this.addLog(`Sent to ${prospect.name}`, "success");
    } else {
      const settings = await getSettings();
      await prospectDb.markFailed(prospectId, reason || "Unknown error");
      this.addLog(`Failed: ${prospect.name} — ${reason}`, "error");

      // Re-read the record for the latest retryCount after markFailed.
      const updated = await this.getProspect(prospectId);

      if (
        settings.autoRetry &&
        updated &&
        updated.retryCount < settings.maxRetries
      ) {
        // Re-queue at the end as PENDING.
        await prospectDb.resetForRetry(prospectId);
        const requeued = await this.getProspect(prospectId);
        if (requeued) this.queue.push(requeued);
        this.addLog(
          `Re-queued ${prospect.name} for retry (attempt ${updated.retryCount})`,
          "warning"
        );
      } else {
        await prospectDb.markSkipped(prospectId);
        this.skippedCount++;
        this.addLog(`Skipped ${prospect.name} — max retries reached`, "error");
      }
      this.failedCount++;
    }

    this.currentIndex++;
    this.broadcastState();

    if (this.state === SendEngineState.PAUSED) return;

    if (this.currentIndex >= this.queue.length) {
      await this.complete();
      return;
    }

    // Delay before the next send.
    await this.waitDelay();
  }

  private async processNext(): Promise<void> {
    if (this.state === SendEngineState.PAUSED) return;
    if (this.currentIndex >= this.queue.length) {
      await this.complete();
      return;
    }

    const prospect = this.queue[this.currentIndex];
    const settings = await getSettings();

    this.setState(SendEngineState.SENDING);
    this.addLog(`Processing ${prospect.name}...`, "info");
    await prospectDb.updateProspect(prospect.id, {
      status: ProspectStatus.SENDING,
    });

    try {
      const tab = await navigateAndWait(
        prospect.profileUrl,
        settings.pageLoadTimeout * 1000
      );
      if (tab.id === undefined) {
        throw new Error("No active tab found");
      }
      // Tell the content script to drive the DOM send. The result comes back
      // asynchronously via SEND_SUCCESS / SEND_FAILED → handleSendResult.
      await chrome.tabs.sendMessage(tab.id, {
        type: "EXECUTE_SEND",
        prospectId: prospect.id,
        message: prospect.message,
      });
    } catch (err) {
      const reason =
        err instanceof Error ? err.message : "Failed to navigate to profile";
      await this.handleSendResult(prospect.id, false, reason);
    }
  }

  private async waitDelay(): Promise<void> {
    const settings = await getSettings();
    const delay = this.randomDelay(settings.minDelay, settings.maxDelay);
    this.waitingSecondsRemaining = delay;

    this.setState(SendEngineState.WAITING);
    this.addLog(`Waiting ${delay}s before next send...`, "info");

    this.countdownInterval = setInterval(() => {
      this.waitingSecondsRemaining = Math.max(
        0,
        this.waitingSecondsRemaining - 1
      );
      this.broadcastState();
    }, 1000);

    return new Promise((resolve) => {
      this.delayTimer = setTimeout(() => {
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        this.waitingSecondsRemaining = 0;
        this.delayTimer = null;
        if (this.state === SendEngineState.PAUSED) {
          resolve();
          return;
        }
        this.setState(SendEngineState.RUNNING);
        this.processNext();
        resolve();
      }, delay * 1000);
    });
  }

  private async complete(): Promise<void> {
    const failed = await prospectDb.getFailedAndSkipped();
    const summary: RunSummary = {
      totalProcessed: this.currentIndex,
      sentCount: this.sentCount,
      failedCount: this.failedCount,
      skippedCount: this.skippedCount,
      failedItems: failed.map((p) => ({
        id: p.id,
        name: p.name,
        reason: p.failureReason || "Skipped",
      })),
      startedAt: this.startedAt,
      completedAt: Date.now(),
    };

    this.setState(SendEngineState.COMPLETED);
    this.addLog("Send run completed", "info");

    chrome.runtime
      .sendMessage({ type: "SEND_RUN_COMPLETED", payload: summary })
      .catch(() => {});

    chrome.alarms.clear(KEEP_ALIVE_ALARM);
    // Reset to idle after broadcasting completion.
    this.state = SendEngineState.IDLE;
  }

  private async getProspect(id: string): Promise<Prospect | undefined> {
    const all = await prospectDb.getAllProspects();
    return all.find((p) => p.id === id);
  }

  private randomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private ensureKeepAlive(): void {
    chrome.alarms.create(KEEP_ALIVE_ALARM, { periodInMinutes: 0.4 });
  }

  private setState(state: SendEngineState): void {
    this.state = state;
    this.broadcastState();
  }

  private addLog(message: string, type: LogEntry["type"]): void {
    this.log.push({ timestamp: Date.now(), message, type });
    if (this.log.length > 50) this.log = this.log.slice(-50);
  }

  // Public so the message handler can rebroadcast on GET_SEND_STATE.
  broadcastState(): void {
    const current = this.queue[this.currentIndex];
    const payload: SendProgress = {
      engineState: this.state,
      currentProspectId: current?.id || null,
      currentProspectName: current?.name || null,
      totalCount: this.queue.length,
      sentCount: this.sentCount,
      failedCount: this.failedCount,
      skippedCount: this.skippedCount,
      currentIndex: this.currentIndex + 1,
      waitingSecondsRemaining: this.waitingSecondsRemaining,
      log: this.log.slice(-20),
    };

    chrome.runtime
      .sendMessage({ type: "SEND_STATE_UPDATE", payload })
      .catch(() => {
        // Side panel may not be open — safe to ignore.
      });
  }

  getState(): SendEngineState {
    return this.state;
  }
}

export const sendEngine = new SendEngine();
export { KEEP_ALIVE_ALARM };
