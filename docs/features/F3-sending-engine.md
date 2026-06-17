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

Per-prospect sequence (technical-design §6.2, §7.3 `executeSend`): navigate → wait for profile load (`waitForElement`, 15s) → find Message button (`resolveElement`, 10s) → open composer → `simulateTyping` into contenteditable → click send → verify (best-effort) → mark `sent` → delay → next. Keep-alive via `chrome.alarms` (`periodInMinutes: 0.4`); state persisted to IndexedDB for recovery.

**DOM resolution (resilient).** Surface is detected by URL path (`/sales` → Sales Navigator, else regular LinkedIn fallback). Message button and Send button are resolved by `resolveElement(strategies, timeout)` ([dom-utils.ts](../../src/content/dom-utils.ts)), which tries a **layered strategy list** ([dom-selectors.ts](../../src/content/dom-selectors.ts) `messageButtonStrategies` / `composerInputStrategies` / `sendButtonStrategies`): exact selector → `data-*`/`type` → `aria-label` → visible-text scan (`findClickableByText`, e.g. `/^message$/i`, `/^send$/i`). Text/aria anchors survive LinkedIn's class-name churn, so a class rename no longer breaks a send on its own. `simulateTyping` uses `execCommand("insertText")` so React's input value-tracker registers the text (raw `textContent` sets are dropped by controlled inputs), with a `textContent` + `InputEvent` fallback. Every step emits a `[DMQ]` `console.debug` line naming what it looked for and which strategy hit/failed.

## 5. UI components

- `views/SendProgress.tsx` — live counter ("Sending 4 of 12…"), current prospect, progress bar, pause/stop, real-time action log.
- `components/ProgressBar.tsx`.
- `hooks/useSendState.ts` — subscribes to `SEND_STATE_UPDATE`; on mount sends `GET_SEND_STATE` to reconnect (AC-25).

**Design reference** ([design system](architecture/02-design-system.md)): screen [send-progress.html](../design-prototype/screens/send-progress.html) (live counter, countdown, activity log with `--log-*` severity colors, `sending` dot pulse); components [ProgressBar](../design-prototype/components/feedback/ProgressBar.jsx), [StatusBadge](../design-prototype/components/feedback/StatusBadge.jsx), [Button](../design-prototype/components/core/Button.jsx) (Pause/Stop, sticky footer).

## 6. Edge cases / empty states / error states

- No eligible prospects → Start disabled; `start()` returns early if queue empty.
- Pause during WAITING → clears delay timer + countdown, halts after current item (no mid-send interruption).
- Side panel closed mid-run → worker continues; broadcasts are `.catch()`-ignored when no panel listening.
- Service worker killed → alarms restart it; recover from persisted IndexedDB state.
- `No active tab found` (user closed all tabs) → run halts, resumable.
- Send verification is fragile by design — if verify can't confirm but the send click executed, treat as success (technical-design §7.3). Per-step failures route to [F4](F4-failure-retry.md). Full error table: technical-design §14.

### Selector validation procedure

Selectors can't be read from Claude's side (no live LinkedIn session), so verification is a capture loop:

1. On a real Sales Navigator lead page (`linkedin.com/sales/lead/…`), open DevTools console and run the capture snippet below. It auto-copies a JSON dump of every Message/Send/InMail candidate (text, aria, class, `data-*`, role) plus all editables.
2. Run it twice: once on the lead page (Message button), once after the composer opens (composer input + Send button).
3. Paste both dumps back; the exact `data-*`/class anchors become the first strategy in each list in [dom-selectors.ts](../../src/content/dom-selectors.ts).
4. When a send still misses, the `[DMQ]` console line names the failed step → re-capture there → refine. Iterate until a real send lands.

```js
(() => {
  const dump = el => ({
    tag: el.tagName.toLowerCase(),
    text: (el.innerText || el.textContent || '').trim().slice(0, 50),
    aria: el.getAttribute('aria-label'),
    cls: el.className,
    role: el.getAttribute('role'),
    type: el.getAttribute('type'),
    data: Object.fromEntries([...el.attributes]
      .filter(a => a.name.startsWith('data-'))
      .map(a => [a.name, a.value])),
  });
  const out = {
    url: location.href,
    path: location.pathname,
    candidates: [...document.querySelectorAll('button, a, [role=button]')]
      .filter(el => /message|send|inmail|connect/i.test(
        (el.innerText || '') + ' ' + (el.getAttribute('aria-label') || '')))
      .map(dump),
    editables: [...document.querySelectorAll(
      '[contenteditable=true], [role=textbox], textarea')].map(dump),
  };
  console.log(JSON.stringify(out, null, 2));
  try { copy(JSON.stringify(out, null, 2)); } catch {}
  return out;
})();
```

**Status:** `SN_SELECTORS` verified against a live Sales Navigator lead page (2026-06-17). Confirmed: Message CTA = `button[aria-label*="Message"]` / `[data-anchor-send-inmail]` (a hidden sticky-header duplicate also matches — `qv()` picks the visible one); composer = a `<textarea aria-label="Type your message here…">` (NOT contenteditable); Send = the button with visible text "Send". A full send (navigate → Message → textarea → type → Send) lands a real InMail.

### Known limitations (future work)

Tracked here so they aren't mistaken for regressions; not yet fixed:

1. **`No active tab found` when Chrome unfocused.** `tab-manager.navigateAndWait` queries `{active: true, currentWindow: true}`; if Chrome has no focused window/tab the query is empty and the send fails. Future: target a specific captured tab id instead of "the active tab".
2. **Sends into whatever tab is active.** The engine drives the current active tab. If the user switches to a non-Sales-Navigator tab mid-run, the next navigate/send happens there. Future: pin sends to a dedicated Sales Navigator tab (open/reuse one); if the active surface isn't Sales Navigator, pause/skip rather than act on the wrong page.
3. **One-click prospect autofill (new feature).** Scrape the open Sales Nav lead page for name, profile URL, role/designation, company, company URL, etc. in one click; leave any field blank when it can't be found. Would populate the Add-prospect form from the live DOM (reuses the `dom-selectors` layer).
