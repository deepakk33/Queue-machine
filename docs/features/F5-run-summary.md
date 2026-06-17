# F5 — Run Summary

> v1 · personal-use Chrome extension

## 1. Overview

After a send run completes, a summary screen reports totals (sent / failed / skipped), lists failed and skipped items with their reasons, and offers a one-click "Retry All Failed". The user can navigate back to the full queue from here.

## 2. Sub-features

- **2.1 Totals** — show total processed, sent, failed, skipped (AC-32).
- **2.2 Failure list** — list failed/skipped items with `failureReason` (AC-33).
- **2.3 Back to queue** — navigate from summary to QueueView (AC-34).
- **2.4 Retry all failed** — bulk reset failed/skipped to pending (AC-30, see [F4](F4-failure-retry.md)).

## 3. Data model

`RunSummary` (technical-design §4.1): `totalProcessed`, `sentCount`, `failedCount`, `skippedCount`, `failedItems[] { id, name, reason }`, `startedAt`, `completedAt`. `failedItems` populated from the `prospects` table after the run.

## 4. Messaging / flow

On `complete()`, the engine builds `RunSummary` and broadcasts `SEND_RUN_COMPLETED { payload }` to the side panel, then resets engine state to `IDLE` (technical-design §6.2). The panel switches to the summary view on receipt. "Retry All Failed" sends `RETRY_ALL_FAILED` to the worker.

## 5. UI components

- `views/RunSummary.tsx` — counts, failed/skipped list with reasons, "Retry All Failed", "Back to Queue".

## 6. Edge cases / empty states / error states

- Zero failures → failure list empty; "Retry All Failed" hidden or disabled.
- `failedItems` is populated from the DB (not the in-memory queue) so it reflects final persisted status.
- Run stopped early (user STOP) vs completed → summary reflects only processed items (`totalProcessed = currentIndex`).
- Reopening side panel after completion → should still be able to reach the last summary or fall back to QueueView.
