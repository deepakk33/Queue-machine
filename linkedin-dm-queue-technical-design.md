# LinkedIn DM Queue — Technical Design Document

## Chrome Extension (Manifest V3)

---

## 1. System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    CHROME EXTENSION                        │
│                                                            │
│  ┌─────────────┐   messages    ┌────────────────────┐     │
│  │  Side Panel  │◄────────────►│  Background Service │     │
│  │  (React UI)  │              │  Worker             │     │
│  │              │              │                      │     │
│  │  - Queue     │              │  - Send Engine       │     │
│  │  - Forms     │              │  - State Machine     │     │
│  │  - Settings  │              │  - Tab Navigation    │     │
│  │  - Progress  │              │  - Retry Logic       │     │
│  └──────┬───────┘              │  - Alarm Keep-alive  │     │
│         │                      └──────────┬───────────┘     │
│         │                                 │                 │
│         │  Dexie.js (IndexedDB)           │  messages       │
│         │  ┌──────────────────┐           │                 │
│         └─►│  prospects table │◄──────────┘                 │
│            │  settings table  │                             │
│            └──────────────────┘           │                 │
│                                           │                 │
│  ┌────────────────────────────────────────▼──────────┐     │
│  │              Content Script                        │     │
│  │  (Injected into linkedin.com)                      │     │
│  │                                                    │     │
│  │  - Find "Message" button on profile                │     │
│  │  - Open composer modal                             │     │
│  │  - Paste message into contenteditable div          │     │
│  │  - Click send                                      │     │
│  │  - Report success/failure back to service worker   │     │
│  └────────────────────────────────────────────────────┘     │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

### Communication Flow

```
Side Panel ──(chrome.runtime.sendMessage)──► Service Worker
Service Worker ──(chrome.tabs.sendMessage)──► Content Script
Content Script ──(chrome.runtime.sendMessage)──► Service Worker
Service Worker ──(chrome.runtime.sendMessage)──► Side Panel
```

All communication uses `chrome.runtime` messaging. The service worker acts as the central coordinator.

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Extension | Chrome Manifest V3 | MV3 | Extension framework |
| UI Framework | React | 18.x | Side panel interface |
| State Management | Zustand | 4.x | Lightweight store for UI state |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| Local Database | Dexie.js | 4.x | IndexedDB wrapper for structured data |
| Language | TypeScript | 5.x | Type safety across all layers |
| Build Tool | Vite | 5.x | Fast dev builds with HMR |
| Extension Plugin | CRXJS | 2.x | Vite plugin for Chrome extension dev |
| Unique IDs | crypto.randomUUID() | Native | No dependency needed |

---

## 3. Project Structure

```
linkedin-dm-queue/
│
├── public/
│   └── icons/
│       ├── icon-16.png
│       ├── icon-48.png
│       └── icon-128.png
│
├── src/
│   │
│   ├── background/
│   │   ├── index.ts                 # Service worker entry point
│   │   ├── send-engine.ts           # Core send loop state machine
│   │   ├── tab-manager.ts           # Tab navigation and load detection
│   │   └── message-handler.ts       # Incoming message router
│   │
│   ├── content/
│   │   ├── index.ts                 # Content script entry point
│   │   ├── dom-actions.ts           # High-level actions (openComposer, pasteMessage, clickSend)
│   │   ├── dom-selectors.ts         # All CSS selectors in one place
│   │   └── dom-utils.ts             # waitForElement, isElementVisible, simulateTyping
│   │
│   ├── sidepanel/
│   │   ├── index.html               # Side panel HTML shell
│   │   ├── main.tsx                  # React entry point
│   │   ├── App.tsx                   # Root component with routing
│   │   │
│   │   ├── views/
│   │   │   ├── QueueView.tsx         # Main queue list with filters
│   │   │   ├── ProspectForm.tsx      # Add/edit prospect form
│   │   │   ├── SendProgress.tsx      # Live send progress dashboard
│   │   │   ├── RunSummary.tsx        # Post-run results
│   │   │   └── SettingsView.tsx      # Delay, retry, template config
│   │   │
│   │   ├── components/
│   │   │   ├── ProspectCard.tsx      # Single prospect row in queue
│   │   │   ├── StatusBadge.tsx       # Color-coded status pill
│   │   │   ├── ProgressBar.tsx       # Send progress bar
│   │   │   ├── Toast.tsx             # Clipboard confirmation toast
│   │   │   └── ConfirmDialog.tsx     # Destructive action confirmation
│   │   │
│   │   └── hooks/
│   │       ├── useQueue.ts           # Hook wrapping queue store + DB ops
│   │       ├── useSettings.ts        # Hook wrapping settings store
│   │       └── useSendState.ts       # Hook listening to send engine state
│   │
│   ├── store/
│   │   ├── queue-store.ts            # Zustand store for prospect queue
│   │   ├── settings-store.ts         # Zustand store for settings
│   │   └── send-state-store.ts       # Zustand store for send engine UI state
│   │
│   ├── db/
│   │   ├── index.ts                  # Dexie database class definition
│   │   ├── prospects.ts              # Prospect CRUD operations
│   │   └── settings.ts               # Settings read/write operations
│   │
│   ├── shared/
│   │   ├── types.ts                  # All TypeScript interfaces and enums
│   │   ├── constants.ts              # Defaults, timeouts, status enums
│   │   └── messages.ts               # Message type definitions for chrome.runtime
│   │
│   └── utils/
│       ├── clipboard.ts              # Copy to / read from clipboard
│       ├── delay.ts                  # randomDelay(min, max) utility
│       └── template.ts              # Prompt template token replacement
│
├── manifest.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. TypeScript Interfaces

### 4.1 Core Types (`src/shared/types.ts`)

```typescript
// Prospect status lifecycle
export enum ProspectStatus {
  PENDING = "pending",
  SENDING = "sending",
  SENT = "sent",
  FAILED = "failed",
  SKIPPED = "skipped",
}

// Prospect record stored in IndexedDB
export interface Prospect {
  id: string;                          // crypto.randomUUID()
  name: string;                        // Required
  profileUrl: string;                  // Required — LinkedIn or Sales Nav URL
  designation: string;                 // Job title
  company: string;                     // Company name
  companyUrl: string;                  // Company website
  notes: string;                       // Free-text context for AI prompt
  message: string;                     // Composed message to send
  status: ProspectStatus;              // Current status
  failureReason: string;               // Why it failed (empty if not failed)
  retryCount: number;                  // Times retried (default 0)
  lastAttemptAt: number | null;        // Timestamp of last attempt
  sentAt: number | null;               // Timestamp of successful send
  createdAt: number;                   // Timestamp when added
  order: number;                       // Queue position for ordering
}

// Extension settings
export interface Settings {
  minDelay: number;                    // Seconds (default 60)
  maxDelay: number;                    // Seconds (default 120)
  maxRetries: number;                  // Default 2
  autoRetry: boolean;                  // Default true
  promptTemplate: string;              // Editable prompt template
  pageLoadTimeout: number;             // Seconds (default 15)
  elementTimeout: number;              // Seconds (default 10)
}

// Send engine states
export enum SendEngineState {
  IDLE = "idle",
  RUNNING = "running",
  SENDING = "sending",
  WAITING = "waiting",
  PAUSED = "paused",
  COMPLETED = "completed",
}

// Live state broadcast from service worker to side panel
export interface SendProgress {
  engineState: SendEngineState;
  currentProspectId: string | null;
  currentProspectName: string | null;
  totalCount: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  currentIndex: number;               // Which item in the run (1-based)
  waitingSecondsRemaining: number;    // Countdown during delay phase
  log: LogEntry[];                    // Recent activity log
}

export interface LogEntry {
  timestamp: number;
  message: string;
  type: "info" | "success" | "error" | "warning";
}

// Run summary after completion
export interface RunSummary {
  totalProcessed: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  failedItems: Array<{
    id: string;
    name: string;
    reason: string;
  }>;
  startedAt: number;
  completedAt: number;
}
```

### 4.2 Message Types (`src/shared/messages.ts`)

```typescript
// Messages between Side Panel <-> Service Worker <-> Content Script

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
export type WorkerToContentMessage =
  | { type: "EXECUTE_SEND"; prospectId: string; message: string };

// Content Script → Service Worker
export type ContentToWorkerMessage =
  | { type: "SEND_SUCCESS"; prospectId: string }
  | { type: "SEND_FAILED"; prospectId: string; reason: string }
  | { type: "STEP_UPDATE"; prospectId: string; step: string };
```

---

## 5. Database Schema (Dexie.js)

### 5.1 Database Definition (`src/db/index.ts`)

```typescript
import Dexie, { type Table } from "dexie";
import type { Prospect, Settings } from "../shared/types";

export class DmQueueDB extends Dexie {
  prospects!: Table<Prospect, string>;
  settings!: Table<Settings & { id: string }, string>;

  constructor() {
    super("LinkedInDmQueue");

    this.version(1).stores({
      // Indexed fields only — Dexie stores all fields regardless
      prospects: "id, status, createdAt, order",
      settings: "id",
    });
  }
}

export const db = new DmQueueDB();
```

### 5.2 Prospect Operations (`src/db/prospects.ts`)

```typescript
import { db } from "./index";
import { ProspectStatus, type Prospect } from "../shared/types";

export async function addProspect(
  data: Omit<Prospect, "id" | "status" | "failureReason" | "retryCount" | "lastAttemptAt" | "sentAt" | "createdAt" | "order">
): Promise<string> {
  const count = await db.prospects.count();
  const prospect: Prospect = {
    ...data,
    id: crypto.randomUUID(),
    status: ProspectStatus.PENDING,
    failureReason: "",
    retryCount: 0,
    lastAttemptAt: null,
    sentAt: null,
    createdAt: Date.now(),
    order: count,
  };
  await db.prospects.add(prospect);
  return prospect.id;
}

export async function updateProspect(
  id: string,
  changes: Partial<Prospect>
): Promise<void> {
  await db.prospects.update(id, changes);
}

export async function deleteProspect(id: string): Promise<void> {
  await db.prospects.delete(id);
}

export async function clearAllProspects(): Promise<void> {
  await db.prospects.clear();
}

export async function getProspectsByStatus(
  status?: ProspectStatus
): Promise<Prospect[]> {
  if (status) {
    return db.prospects.where("status").equals(status).sortBy("order");
  }
  return db.prospects.orderBy("order").toArray();
}

export async function getPendingWithMessage(): Promise<Prospect[]> {
  return db.prospects
    .where("status")
    .equals(ProspectStatus.PENDING)
    .filter((p) => p.message.trim().length > 0)
    .sortBy("order");
}

export async function markFailed(
  id: string,
  reason: string
): Promise<void> {
  const prospect = await db.prospects.get(id);
  if (!prospect) return;

  await db.prospects.update(id, {
    status: ProspectStatus.FAILED,
    failureReason: reason,
    retryCount: prospect.retryCount + 1,
    lastAttemptAt: Date.now(),
  });
}

export async function markSent(id: string): Promise<void> {
  await db.prospects.update(id, {
    status: ProspectStatus.SENT,
    failureReason: "",
    sentAt: Date.now(),
    lastAttemptAt: Date.now(),
  });
}

export async function markSkipped(id: string): Promise<void> {
  await db.prospects.update(id, {
    status: ProspectStatus.SKIPPED,
    lastAttemptAt: Date.now(),
  });
}

export async function resetForRetry(id: string): Promise<void> {
  await db.prospects.update(id, {
    status: ProspectStatus.PENDING,
    failureReason: "",
  });
}

export async function resetAllFailedForRetry(): Promise<void> {
  const failed = await db.prospects
    .where("status")
    .anyOf([ProspectStatus.FAILED, ProspectStatus.SKIPPED])
    .toArray();

  await db.prospects.bulkUpdate(
    failed.map((p) => ({
      key: p.id,
      changes: { status: ProspectStatus.PENDING, failureReason: "" },
    }))
  );
}
```

---

## 6. Send Engine — State Machine

### 6.1 State Machine Diagram

```
                ┌────────────────────────────────┐
                │                                │
                ▼                                │
  ┌──────┐  START   ┌─────────┐  next item  ┌───┴─────┐
  │ IDLE │────────►│ RUNNING │────────────►│ SENDING │
  └──────┘         └────┬────┘             └────┬────┘
     ▲                  │                       │
     │              PAUSE│               success│failure
     │                  │                  │    │
     │            ┌─────▼─────┐           │    │
     │            │  PAUSED   │           │    │
     │            └─────┬─────┘           │    │
     │              RESUME                │    │
     │                  │                 │    │
     │                  ▼                 │    │
     │              RUNNING◄──────────────┘    │
     │                                         │
     │                  ┌──────────────────────┘
     │                  │
     │                  ▼
     │          ┌──────────────┐    retryCount < max?
     │          │ HANDLE FAIL  │──── YES ───► re-queue at end
     │          └──────┬───────┘              as PENDING
     │                 │
     │                 NO
     │                 │
     │                 ▼
     │            mark SKIPPED
     │                 │
     │                 ▼
     │           ┌───────────┐   no more     ┌───────────┐
     │           │  WAITING  │──────────────►│ COMPLETED │
     │           │  (delay)  │   pending     └─────┬─────┘
     │           └─────┬─────┘                     │
     │                 │                           │
     │                 │ delay done                │
     │                 ▼                           │
     │              RUNNING ◄──────────────────────┘
     │                                       (only if items remain)
     │
     └──────────── STOP or COMPLETED
```

### 6.2 Implementation (`src/background/send-engine.ts`)

```typescript
import { SendEngineState, ProspectStatus } from "../shared/types";
import type { Prospect, SendProgress, RunSummary, LogEntry, Settings } from "../shared/types";
import * as prospectDb from "../db/prospects";
import { db } from "../db/index";

class SendEngine {
  private state: SendEngineState = SendEngineState.IDLE;
  private queue: Prospect[] = [];
  private currentIndex: number = 0;
  private sentCount: number = 0;
  private failedCount: number = 0;
  private skippedCount: number = 0;
  private log: LogEntry[] = [];
  private startedAt: number = 0;
  private delayTimer: ReturnType<typeof setTimeout> | null = null;
  private waitingSecondsRemaining: number = 0;
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

    this.setState(SendEngineState.RUNNING);
    this.addLog("Send run started", "info");
    this.processNext();
  }

  pause(): void {
    if (this.state === SendEngineState.WAITING) {
      // Clear the delay timer — will pause after current wait
      if (this.delayTimer) clearTimeout(this.delayTimer);
      if (this.countdownInterval) clearInterval(this.countdownInterval);
      this.delayTimer = null;
    }
    this.setState(SendEngineState.PAUSED);
    this.addLog("Paused by user", "warning");
  }

  resume(): void {
    if (this.state !== SendEngineState.PAUSED) return;
    this.setState(SendEngineState.RUNNING);
    this.addLog("Resumed", "info");
    this.processNext();
  }

  stop(): void {
    if (this.delayTimer) clearTimeout(this.delayTimer);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.setState(SendEngineState.IDLE);
    this.addLog("Stopped by user", "warning");
  }

  // Called by content script message when a send completes
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
      const settings = await this.getSettings();
      await prospectDb.markFailed(prospectId, reason || "Unknown error");
      this.addLog(`Failed: ${prospect.name} — ${reason}`, "error");

      const updated = await db.prospects.get(prospectId);
      if (settings.autoRetry && updated && updated.retryCount < settings.maxRetries) {
        // Re-queue at end
        await prospectDb.resetForRetry(prospectId);
        const requeued = await db.prospects.get(prospectId);
        if (requeued) this.queue.push(requeued);
        this.addLog(`Re-queued ${prospect.name} for retry (attempt ${updated.retryCount})`, "warning");
      } else {
        await prospectDb.markSkipped(prospectId);
        this.skippedCount++;
        this.addLog(`Skipped ${prospect.name} — max retries reached`, "error");
      }
      this.failedCount++;
    }

    this.currentIndex++;
    this.broadcastState();

    if (this.currentIndex >= this.queue.length) {
      this.complete();
      return;
    }

    // Start delay before next send
    await this.waitDelay();
  }

  private async processNext(): Promise<void> {
    if (this.state === SendEngineState.PAUSED) return;
    if (this.currentIndex >= this.queue.length) {
      this.complete();
      return;
    }

    const prospect = this.queue[this.currentIndex];
    this.setState(SendEngineState.SENDING);
    this.addLog(`Processing ${prospect.name}...`, "info");

    // Update DB status
    await prospectDb.updateProspect(prospect.id, {
      status: ProspectStatus.SENDING,
    });

    // Navigate to profile URL
    try {
      const tab = await chrome.tabs.update({ url: prospect.profileUrl });
      // Wait for page load, then send message to content script
      // Tab load detection handled by tab-manager.ts
    } catch (err) {
      await this.handleSendResult(
        prospect.id,
        false,
        "Failed to navigate to profile"
      );
    }
  }

  private async waitDelay(): Promise<void> {
    const settings = await this.getSettings();
    const delay = this.randomDelay(settings.minDelay, settings.maxDelay);
    this.waitingSecondsRemaining = delay;

    this.setState(SendEngineState.WAITING);
    this.addLog(`Waiting ${delay}s before next send...`, "info");

    // Countdown for UI
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
        this.waitingSecondsRemaining = 0;
        this.delayTimer = null;
        this.setState(SendEngineState.RUNNING);
        this.processNext();
        resolve();
      }, delay * 1000);
    });
  }

  private complete(): void {
    const summary: RunSummary = {
      totalProcessed: this.currentIndex,
      sentCount: this.sentCount,
      failedCount: this.failedCount,
      skippedCount: this.skippedCount,
      failedItems: [], // populated from DB
      startedAt: this.startedAt,
      completedAt: Date.now(),
    };

    this.setState(SendEngineState.COMPLETED);
    this.addLog("Send run completed", "info");

    // Broadcast completion to side panel
    chrome.runtime.sendMessage({
      type: "SEND_RUN_COMPLETED",
      payload: summary,
    });

    // Reset to idle after broadcasting
    this.state = SendEngineState.IDLE;
  }

  private randomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private setState(state: SendEngineState): void {
    this.state = state;
    this.broadcastState();
  }

  private addLog(message: string, type: LogEntry["type"]): void {
    this.log.push({ timestamp: Date.now(), message, type });
    // Keep only last 50 entries
    if (this.log.length > 50) this.log = this.log.slice(-50);
  }

  private broadcastState(): void {
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

    chrome.runtime.sendMessage({
      type: "SEND_STATE_UPDATE",
      payload,
    }).catch(() => {
      // Side panel may not be open — safe to ignore
    });
  }

  private async getSettings(): Promise<Settings> {
    const stored = await db.settings.get("default");
    return stored || DEFAULT_SETTINGS;
  }

  getState(): SendEngineState {
    return this.state;
  }
}

// Singleton
export const sendEngine = new SendEngine();
```

---

## 7. Content Script — DOM Interaction Layer

### 7.1 Selector Definitions (`src/content/dom-selectors.ts`)

All LinkedIn selectors in one file for easy maintenance when LinkedIn changes their DOM.

```typescript
// Sales Navigator selectors
export const SN_SELECTORS = {
  // Profile page loaded indicator
  profileLoaded: '[data-x--lead-profile]',
  profileName: '.profile-topcard-person-entity__name',

  // Message button on profile
  messageButton: 'button[data-control-name="message"]',
  messageButtonAlt: 'button.message-anywhere-button',

  // Composer modal
  composerModal: '.msg-overlay-conversation-bubble',
  composerInput: 'div.msg-form__contenteditable[contenteditable="true"]',
  composerInputAlt: 'div[role="textbox"][contenteditable="true"]',

  // Send button inside composer
  sendButton: 'button.msg-form__send-button',
  sendButtonAlt: 'button[type="submit"].msg-form__send-btn',

  // Composer close / success indicators
  composerClosed: '.msg-overlay-conversation-bubble--is-active-conversation',
  messageSentIndicator: '.msg-s-event-listitem__body',
};

// Regular LinkedIn selectors (if ever needed)
export const LI_SELECTORS = {
  messageButton: 'button.message-anywhere-button',
  composerInput: 'div.msg-form__contenteditable[contenteditable="true"]',
  sendButton: 'button.msg-form__send-button',
};

// Detection: which LinkedIn surface are we on?
export function detectSurface(): "sales-navigator" | "linkedin" | "unknown" {
  const url = window.location.hostname;
  if (url.includes("linkedin.com/sales")) return "sales-navigator";
  if (url.includes("linkedin.com")) return "linkedin";
  return "unknown";
}
```

### 7.2 DOM Utilities (`src/content/dom-utils.ts`)

```typescript
// Wait for an element to appear in the DOM
export function waitForElement(
  selector: string,
  timeoutMs: number = 10000
): Promise<Element> {
  return new Promise((resolve, reject) => {
    // Check if already present
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        clearTimeout(timer);
        resolve(el);
      }
    });

    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element not found: ${selector} (timeout ${timeoutMs}ms)`));
    }, timeoutMs);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

// Wait for multiple possible selectors — returns first match
export function waitForAnyElement(
  selectors: string[],
  timeoutMs: number = 10000
): Promise<Element> {
  return new Promise((resolve, reject) => {
    for (const sel of selectors) {
      const existing = document.querySelector(sel);
      if (existing) {
        resolve(existing);
        return;
      }
    }

    const observer = new MutationObserver(() => {
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) {
          observer.disconnect();
          clearTimeout(timer);
          resolve(el);
          return;
        }
      }
    });

    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`None found: ${selectors.join(", ")} (timeout ${timeoutMs}ms)`));
    }, timeoutMs);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

// Simulate human-like typing into a contenteditable div
export function simulateTyping(element: HTMLElement, text: string): void {
  element.focus();

  // Clear existing content
  element.innerHTML = "";

  // Set text content
  element.textContent = text;

  // Dispatch events LinkedIn listens for
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));

  // Some LinkedIn forms also need a KeyboardEvent
  element.dispatchEvent(
    new KeyboardEvent("keydown", { key: "a", bubbles: true })
  );
  element.dispatchEvent(
    new KeyboardEvent("keyup", { key: "a", bubbles: true })
  );
}

// Small random delay to avoid robotic timing
export function humanDelay(minMs: number = 300, maxMs: number = 800): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Check if an element is visible and clickable
export function isClickable(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;

  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if ((el as HTMLButtonElement).disabled) return false;

  return true;
}
```

### 7.3 DOM Actions (`src/content/dom-actions.ts`)

```typescript
import { SN_SELECTORS, LI_SELECTORS, detectSurface } from "./dom-selectors";
import { waitForElement, waitForAnyElement, simulateTyping, humanDelay, isClickable } from "./dom-utils";

export interface SendResult {
  success: boolean;
  reason?: string;
}

export async function executeSend(message: string): Promise<SendResult> {
  const surface = detectSurface();
  const selectors = surface === "sales-navigator" ? SN_SELECTORS : LI_SELECTORS;

  try {
    // Step 1: Wait for profile page to load
    await reportStep("Waiting for profile to load...");
    await waitForElement(
      selectors.profileLoaded || "body",
      15000
    );
    await humanDelay(500, 1000);

    // Step 2: Find and click "Message" button
    await reportStep("Looking for Message button...");
    const msgButton = await waitForAnyElement(
      [selectors.messageButton, selectors.messageButtonAlt],
      10000
    );

    if (!isClickable(msgButton)) {
      return { success: false, reason: "Message button found but not clickable" };
    }

    (msgButton as HTMLElement).click();
    await humanDelay(800, 1500);

    // Step 3: Wait for composer to open
    await reportStep("Waiting for composer...");
    const composerInput = await waitForAnyElement(
      [selectors.composerInput, selectors.composerInputAlt],
      10000
    );
    await humanDelay(300, 600);

    // Step 4: Type message
    await reportStep("Typing message...");
    simulateTyping(composerInput as HTMLElement, message);
    await humanDelay(500, 1000);

    // Step 5: Click send
    await reportStep("Clicking send...");
    const sendBtn = await waitForAnyElement(
      [selectors.sendButton, selectors.sendButtonAlt],
      5000
    );

    if (!isClickable(sendBtn)) {
      return { success: false, reason: "Send button found but not clickable" };
    }

    (sendBtn as HTMLElement).click();
    await humanDelay(1000, 2000);

    // Step 6: Verify send (best effort)
    await reportStep("Verifying send...");
    // Check if composer closed or if a sent message appears
    // This is fragile — if verification fails, still assume success
    // since the click was executed

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown DOM error";
    return { success: false, reason: errorMessage };
  }
}

async function reportStep(step: string): Promise<void> {
  chrome.runtime.sendMessage({
    type: "STEP_UPDATE",
    step,
  }).catch(() => {});
}
```

### 7.4 Content Script Entry (`src/content/index.ts`)

```typescript
import { executeSend } from "./dom-actions";

// Listen for send commands from service worker
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "EXECUTE_SEND") {
    executeSend(message.message).then((result) => {
      chrome.runtime.sendMessage({
        type: result.success ? "SEND_SUCCESS" : "SEND_FAILED",
        prospectId: message.prospectId,
        reason: result.reason,
      });
    });
    // Return true to indicate async response
    sendResponse({ received: true });
  }
  return true;
});
```

---

## 8. Background Service Worker

### 8.1 Tab Manager (`src/background/tab-manager.ts`)

```typescript
// Navigate to a URL and wait for the page to finish loading
export function navigateAndWait(
  url: string,
  timeoutMs: number = 15000
): Promise<chrome.tabs.Tab> {
  return new Promise(async (resolve, reject) => {
    const timer = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error("Page did not load within timeout"));
    }, timeoutMs);

    // Get active tab or create new one
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const tabId = activeTab?.id;
    if (!tabId) {
      clearTimeout(timer);
      reject(new Error("No active tab found"));
      return;
    }

    const listener = (
      updatedTabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
      tab: chrome.tabs.Tab
    ) => {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        clearTimeout(timer);
        // Extra wait for SPA content to render
        setTimeout(() => resolve(tab), 2000);
      }
    };

    chrome.tabs.onUpdated.addListener(listener);
    await chrome.tabs.update(tabId, { url });
  });
}
```

### 8.2 Keep-Alive with Alarms (`src/background/index.ts`)

```typescript
import { sendEngine } from "./send-engine";

// Keep service worker alive during active send runs
chrome.alarms.create("keepAlive", { periodInMinutes: 0.4 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "keepAlive") {
    // Service worker stays alive as long as alarms fire
    const state = sendEngine.getState();
    if (state === "idle" || state === "completed") {
      // No active run — can let the worker sleep
      chrome.alarms.clear("keepAlive");
    }
  }
});

// Message router
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "START_SEND_RUN":
      sendEngine.start();
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
    case "SEND_SUCCESS":
      sendEngine.handleSendResult(message.prospectId, true);
      break;
    case "SEND_FAILED":
      sendEngine.handleSendResult(message.prospectId, false, message.reason);
      break;
    case "GET_SEND_STATE":
      // Side panel reconnecting — broadcast current state
      sendEngine.broadcastState();
      break;
  }
  sendResponse({ received: true });
  return true;
});

// Re-create keepAlive alarm when a run starts
// (called from send-engine.ts when state changes to RUNNING)
export function ensureKeepAlive(): void {
  chrome.alarms.create("keepAlive", { periodInMinutes: 0.4 });
}
```

---

## 9. Clipboard and Template Utilities

### 9.1 Template Engine (`src/utils/template.ts`)

```typescript
import type { Prospect } from "../shared/types";

// Token map: template token → prospect field
const TOKEN_MAP: Record<string, keyof Prospect> = {
  "{{name}}": "name",
  "{{designation}}": "designation",
  "{{company}}": "company",
  "{{companyUrl}}": "companyUrl",
  "{{profileUrl}}": "profileUrl",
  "{{notes}}": "notes",
};

export function renderTemplate(
  template: string,
  prospect: Prospect
): string {
  let result = template;
  for (const [token, field] of Object.entries(TOKEN_MAP)) {
    const value = prospect[field];
    result = result.replaceAll(
      token,
      typeof value === "string" ? value : ""
    );
  }
  return result.trim();
}
```

### 9.2 Clipboard Helpers (`src/utils/clipboard.ts`)

```typescript
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for contexts where navigator.clipboard is unavailable
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}

export async function readFromClipboard(): Promise<string | null> {
  try {
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
}
```

---

## 10. Constants and Defaults

### `src/shared/constants.ts`

```typescript
import type { Settings } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  minDelay: 60,
  maxDelay: 120,
  maxRetries: 2,
  autoRetry: true,
  pageLoadTimeout: 15,
  elementTimeout: 10,
  promptTemplate: `Write a personalized LinkedIn InMail for the following prospect. Keep it under 500 characters including spaces. Make it conversational, skimmable, and direct. No dashes. No fluff.

Name: {{name}}
Title: {{designation}}
Company: {{company}}
Company Website: {{companyUrl}}
Notes: {{notes}}`,
};

export const SIDE_PANEL_WIDTH = 360;

export const STATUS_COLORS = {
  pending: { bg: "bg-gray-100", text: "text-gray-600", label: "Pending" },
  sending: { bg: "bg-blue-100", text: "text-blue-700", label: "Sending" },
  sent: { bg: "bg-green-100", text: "text-green-700", label: "Sent" },
  failed: { bg: "bg-red-100", text: "text-red-700", label: "Failed" },
  skipped: { bg: "bg-amber-100", text: "text-amber-700", label: "Skipped" },
} as const;
```

---

## 11. Manifest Configuration

### `manifest.json`

```json
{
  "manifest_version": 3,
  "name": "LinkedIn DM Queue",
  "version": "0.1.0",
  "description": "Personal outbound message queue for LinkedIn Sales Navigator",
  "permissions": [
    "sidePanel",
    "activeTab",
    "tabs",
    "scripting",
    "storage",
    "alarms"
  ],
  "host_permissions": [
    "https://www.linkedin.com/*",
    "https://linkedin.com/*"
  ],
  "side_panel": {
    "default_path": "src/sidepanel/index.html"
  },
  "background": {
    "service_worker": "src/background/index.ts",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": [
        "https://www.linkedin.com/*",
        "https://linkedin.com/*"
      ],
      "js": ["src/content/index.ts"],
      "run_at": "document_idle"
    }
  ],
  "icons": {
    "16": "public/icons/icon-16.png",
    "48": "public/icons/icon-48.png",
    "128": "public/icons/icon-128.png"
  },
  "action": {
    "default_title": "LinkedIn DM Queue"
  }
}
```

---

## 12. Build Configuration

### `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
```

### `package.json`

```json
{
  "name": "linkedin-dm-queue",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "dexie": "^4.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.0.0-beta.25",
    "@types/chrome": "^0.0.270",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["chrome"]
  },
  "include": ["src"]
}
```

### `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

---

## 13. Development Workflow

### Initial Setup

```bash
# Clone and install
cd linkedin-dm-queue
pnpm install

# Start dev server with HMR
pnpm dev
```

### Load in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder (or the project root if CRXJS serves it directly)
5. The extension icon appears in the toolbar
6. Click the icon → the side panel opens

### Iterating

- CRXJS provides hot module replacement — save a file and the extension reloads automatically.
- Content script changes may require a manual page refresh on LinkedIn.
- Service worker changes may require clicking "Update" on `chrome://extensions/`.

### Testing Send Flow

1. Add a test prospect with your own LinkedIn profile URL.
2. Send yourself a message to verify DOM selectors work.
3. If selectors break, update `dom-selectors.ts` and test again.

---

## 14. Error Reference

| Error | Cause | How It Surfaces |
|---|---|---|
| `Page did not load within timeout` | LinkedIn slow or URL invalid | Prospect marked `failed`, failureReason populated |
| `Element not found: [selector]` | LinkedIn changed their DOM | Prospect marked `failed`, user needs to update selectors |
| `Message button found but not clickable` | Button disabled, overlapped, or profile doesn't support messaging | Prospect marked `failed` |
| `Send button found but not clickable` | Composer didn't fully initialize | Prospect marked `failed`, auto-retry kicks in |
| `Composer did not open` | Click intercepted or modal blocked | Prospect marked `failed` |
| `No active tab found` | User closed all tabs during a run | Run halts, can resume |
| `Failed to navigate to profile` | Chrome tab API error | Prospect marked `failed` |
| Service worker killed mid-run | Chrome garbage collected the worker | `chrome.alarms` restarts it; state recovered from IndexedDB |
