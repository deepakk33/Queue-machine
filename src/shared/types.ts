// All TypeScript interfaces and enums — technical-design §4.1

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
  id: string; // crypto.randomUUID()
  name: string; // Required
  profileUrl: string; // Required — LinkedIn or Sales Nav URL
  designation: string; // Job title
  company: string; // Company name
  companyUrl: string; // Company website
  notes: string; // Free-text context for AI prompt
  message: string; // Composed message to send
  status: ProspectStatus; // Current status
  failureReason: string; // Why it failed (empty if not failed)
  retryCount: number; // Times retried (default 0)
  lastAttemptAt: number | null; // Timestamp of last attempt
  sentAt: number | null; // Timestamp of successful send
  createdAt: number; // Timestamp when added
  order: number; // Queue position for ordering
}

// Extension settings
export interface Settings {
  minDelay: number; // Seconds (default 60)
  maxDelay: number; // Seconds (default 120)
  maxRetries: number; // Default 2
  autoRetry: boolean; // Default true
  promptTemplate: string; // Editable prompt template
  pageLoadTimeout: number; // Seconds (default 15)
  elementTimeout: number; // Seconds (default 10)
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
  currentIndex: number; // Which item in the run (1-based)
  waitingSecondsRemaining: number; // Countdown during delay phase
  log: LogEntry[]; // Recent activity log
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
