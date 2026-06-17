# F3 — Sending Engine

> v1 · personal-use Chrome extension

## 1. Overview

The send engine is a state machine in the background service worker that processes `pending` prospects with a non-empty message, sequentially, through the Sales Navigator UI. For each it navigates to the profile, opens the composer, pastes the message, clicks send, then waits a randomized delay before the next. The user can pause/resume; closing the side panel does not cancel the run.

## 2. Sub-features

- **2.1 Start gating** — "Start Sending" disabled unless ≥1 `pending` prospect has a non-empty message (AC-15); `getPendingWithMessage()`.
- **2.2 Sequential navigation** — navigate to each `profileUrl` in order (AC-16).
- **2.3 Wait for load** — confirm profile rendered before acting (AC-17).
- **2.4 Send sequence** — find Message button → open composer → paste → send (AC-18).
- **2.5 Step timeouts** — each step times out (default 10-15s) → mark `failed` with reason (AC-19, see [F4](F4-failure-retry.md)).
- **2.6 Randomized delay** — wait `minDelay`..`maxDelay` between sends (AC-20).
- **2.7 Auto-advance** — loop until queue exhausted (AC-21).
- **2.8 Pause / resume** — pause lets in-flight message finish then halts (AC-22); resume continues from next pending (AC-23).
- **2.9 Detach-safe** — closing side panel does not cancel run (AC-24); reopening reconnects to live state (AC-25).

## 3. Data model

Operates on `Prospect.status` transitions: `pending → sending → sent | failed`. On run completion produces a `RunSummary` (see [F5](F5-run-summary.md)). Live state broadcast as `SendProgress` (technical-design §4.1): `engineState`, `currentProspectId/Name`, counts, `currentIndex`, `waitingSecondsRemaining`, `log[]`.

State machine: `IDLE → RUNNING → SENDING → WAITING → RUNNING → … → COMPLETED`, with PAUSED branch and failure handling (technical-design §6.1, requirements §6.1). `SendEngineState` enum: `idle · running · sending · waiting · paused · completed`.

## 4. Messaging / flow

`SendEngine` singleton in `src/background/send-engine.ts`; tab nav in `tab-manager.ts`; keep-alive + router in `background/index.ts`.

| Direction | Message |
|---|---|
| Panel → Worker | `START_SEND_RUN`, `PAUSE_SEND_RUN`, `RESUME_SEND_RUN`, `STOP_SEND_RUN`, `GET_SEND_STATE` |
| Worker → Content | `EXECUTE_SEND { prospectId, message }` |
| Content → Worker | `SEND_SUCCESS`, `SEND_FAILED { reason }`, `STEP_UPDATE { step }` |
| Worker → Panel | `SEND_STATE_UPDATE { SendProgress }`, `SEND_RUN_COMPLETED { RunSummary }`, `PROSPECT_STATUS_CHANGED` |

Per-prospect sequence (technical-design §6.2, §7.3 `executeSend`): navigate → wait for profile load (`waitForElement`, 15s) → find Message button (`waitForAnyElement`, 10s) → open composer → `simulateTyping` into contenteditable → click send → verify (best-effort) → mark `sent` → delay → next. Keep-alive via `chrome.alarms` (`periodInMinutes: 0.4`); state persisted to IndexedDB for recovery.

## 5. UI components

- `views/SendProgress.tsx` — live counter ("Sending 4 of 12…"), current prospect, progress bar, pause/stop, real-time action log.
- `components/ProgressBar.tsx`.
- `hooks/useSendState.ts` — subscribes to `SEND_STATE_UPDATE`; on mount sends `GET_SEND_STATE` to reconnect (AC-25).

## 6. Edge cases / empty states / error states

- No eligible prospects → Start disabled; `start()` returns early if queue empty.
- Pause during WAITING → clears delay timer + countdown, halts after current item (no mid-send interruption).
- Side panel closed mid-run → worker continues; broadcasts are `.catch()`-ignored when no panel listening.
- Service worker killed → alarms restart it; recover from persisted IndexedDB state.
- `No active tab found` (user closed all tabs) → run halts, resumable.
- Send verification is fragile by design — if verify can't confirm but the send click executed, treat as success (technical-design §7.3). Per-step failures route to [F4](F4-failure-retry.md). Full error table: technical-design §14.
