// Defaults, timeouts, status colors — technical-design §10
import type { Settings } from "./types";

export const SETTINGS_KEY = "default";

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

// Status pill colors — ported from the "Queue" design system (--status-*-{bg,fg,dot}).
// Literal class strings here so Tailwind's content scan picks them up.
export const STATUS_COLORS = {
  pending: { bg: "bg-stone-100", text: "text-stone-600", dot: "bg-stone-400", label: "pending" },
  sending: { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500", label: "sending" },
  sent: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "sent" },
  failed: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: "failed" },
  skipped: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "skipped" },
} as const;
