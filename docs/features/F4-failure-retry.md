# F4 — Failure & Retry

> v1 · personal-use Chrome extension

## 1. Overview

When a send step fails, the engine records the reason, increments the retry count, and — if auto-retry is on and the cap not reached — re-queues the prospect at the end of the run. Once retries are exhausted the prospect is marked `skipped`. The user can also manually retry any `failed`/`skipped` item individually or in bulk.

## 2. Sub-features

- **2.1 Record failure** — increment `retryCount`, set `failureReason`, set `lastAttemptAt` (AC-26).
- **2.2 Auto re-queue** — if `autoRetry` and `retryCount < maxRetries`, reset to `pending` and push to end of run (AC-27).
- **2.3 Skip on exhaustion** — `retryCount >= maxRetries` → `skipped` (AC-28).
- **2.4 Manual retry (single)** — "Retry" button on any failed/skipped item (AC-29).
- **2.5 Retry all failed** — bulk reset from run summary (AC-30, see [F5](F5-run-summary.md)).
- **2.6 Clean re-run** — retry clears `failureReason` and re-runs the full send sequence (AC-31).

## 3. Data model

`Prospect` fields: `status` (`failed`/`skipped`), `failureReason`, `retryCount` (default 0), `lastAttemptAt`. Governed by `Settings.maxRetries` (default 2) and `Settings.autoRetry` (default true) — see [F6](F6-settings.md).

DB helpers (technical-design §5.2): `markFailed(id, reason)` (increments retryCount), `markSkipped(id)`, `resetForRetry(id)` (status→pending, clears reason), `resetAllFailedForRetry()` (bulk, covers failed + skipped).

## 4. Messaging / flow

Handled inside `SendEngine.handleSendResult()` (technical-design §6.2) on `SEND_FAILED` from the content script:

1. `markFailed` → increment retryCount + log reason.
2. Read settings; if `autoRetry && retryCount < maxRetries` → `resetForRetry` and push the refreshed record onto the in-memory queue (retry at end of run).
3. Else → `markSkipped`.

Manual retry: Panel → Worker `RETRY_PROSPECT { prospectId }` / `RETRY_ALL_FAILED` → reset to `pending`, eligible for next run.

## 5. UI components

- `components/ProspectCard.tsx` — per-item "Retry" button + `failureReason` display for failed/skipped rows.
- `views/RunSummary.tsx` — "Retry All Failed" (see [F5](F5-run-summary.md)).
- `components/StatusBadge.tsx` — `failed` (red), `skipped` (amber).

**Design reference** ([design system](architecture/02-design-system.md)): screens [run-summary.html](../design-prototype/screens/run-summary.html) (failed-items list) + [queue.html](../design-prototype/screens/queue.html) (per-row retry); components [StatusBadge](../design-prototype/components/feedback/StatusBadge.jsx) (`failed`=terracotta `--status-failed-*`, `skipped`=amber `--status-skipped-*`), [Button](../design-prototype/components/core/Button.jsx) (Retry). Failure reasons surfaced verbatim, never a stack trace.

## 6. Edge cases / empty states / error states

- `maxRetries: 0` → no auto-retry; first failure goes straight to `skipped`.
- Failure reasons come from the DOM layer (technical-design §14): "Message button not found", "Composer did not open", "Send button found but not clickable", "Page did not load", "Failed to navigate to profile", etc.
- "Retry button found but not clickable" auto-retries (composer not fully initialized).
- Re-queued item retains incremented `retryCount` across the run, so the cap is honored cumulatively.
- Manual retry of a `skipped` item resets it to `pending` regardless of prior retryCount (user override).
