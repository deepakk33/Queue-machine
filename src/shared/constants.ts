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

// Literal class strings here so Tailwind's content scan picks them up.
export const STATUS_COLORS = {
  pending: { bg: "bg-gray-100", text: "text-gray-600", label: "Pending" },
  sending: { bg: "bg-blue-100", text: "text-blue-700", label: "Sending" },
  sent: { bg: "bg-green-100", text: "text-green-700", label: "Sent" },
  failed: { bg: "bg-red-100", text: "text-red-700", label: "Failed" },
  skipped: { bg: "bg-amber-100", text: "text-amber-700", label: "Skipped" },
} as const;
