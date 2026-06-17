# 01 — System Overview

Personal-use Chrome extension (Manifest V3) that sends LinkedIn Sales Navigator InMails from a locally-managed prospect queue, one by one, with human-like delays. Single user, no backend, no cloud sync, no auth.

## Contexts (C4 containers)

Three execution contexts inside one extension, coordinated by message passing.

```
┌──────────────────────────────────────────────────────────┐
│                    CHROME EXTENSION                        │
│                                                            │
│  ┌─────────────┐   messages    ┌────────────────────┐     │
│  │  Side Panel  │◄────────────►│  Background Service │     │
│  │  (React UI)  │              │  Worker             │     │
│  │  - Queue     │              │  - Send Engine      │     │
│  │  - Forms     │              │  - State Machine    │     │
│  │  - Settings  │              │  - Tab Navigation   │     │
│  │  - Progress  │              │  - Retry Logic      │     │
│  └──────┬───────┘              │  - Alarm Keep-alive │     │
│         │                      └──────────┬──────────┘     │
│         │  Dexie.js (IndexedDB)           │                │
│         │  ┌──────────────────┐           │                │
│         └─►│  prospects table │◄──────────┘                │
│            │  settings table  │                            │
│            └──────────────────┘                            │
│  ┌────────────────────────────────────────▼─────────┐     │
│  │  Content Script (injected into linkedin.com)      │     │
│  │  - Find Message button · open composer            │     │
│  │  - Paste into contenteditable · click send        │     │
│  │  - Report success/failure to service worker       │     │
│  └───────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

| Context | Tech | Responsibility |
|---|---|---|
| **Side Panel** | React 18 + Zustand + Tailwind, `chrome.sidePanel` | All queue management UI. Stays open while browsing (unlike a popup). Reconnects to live send state on reopen. |
| **Background Service Worker** | TS, `chrome.tabs` / `chrome.alarms` | Send-loop state machine, tab navigation to profile URLs, retry/delay timers, keep-alive. Central coordinator. |
| **Content Script** | Vanilla TS, `MutationObserver` | All DOM interaction on `linkedin.com`. Finds message button, opens composer, pastes, clicks send. |
| **Data tier** | Dexie.js (IndexedDB) | `prospects` + `settings` tables. No 10MB cap; structured queries. Survives browser restart. |

## Message flow

```
Side Panel ──(chrome.runtime.sendMessage)──► Service Worker
Service Worker ──(chrome.tabs.sendMessage)──► Content Script
Content Script ──(chrome.runtime.sendMessage)──► Service Worker
Service Worker ──(chrome.runtime.sendMessage)──► Side Panel
```

Message type definitions: technical-design §4.2 (`PanelToWorkerMessage`, `WorkerToPanelMessage`, `WorkerToContentMessage`, `ContentToWorkerMessage`).

## Surface focus & risks

- **Sales Navigator first.** Content script detects surface (`detectSurface()`); regular LinkedIn selectors are a fallback. Selectors centralized in `dom-selectors.ts` for fast repair when LinkedIn changes DOM.
- **Bot detection** mitigated by randomized delays (60-120s default) and human-like interaction timing. Personal use lowers risk.
- **Service worker death** mid-run mitigated by `chrome.alarms` keep-alive + send state persisted to IndexedDB so a run can recover.
- **Clipboard** uses `navigator.clipboard` with `document.execCommand` fallback.

Full risk table: requirements §13.

## Feature map

| Doc | Covers |
|---|---|
| [F1 — Prospect Queue](../F1-prospect-queue.md) | Add/edit/delete prospects, persistence, status, filter |
| [F2 — Message Composition](../F2-message-composition.md) | Copy Context / Paste Message clipboard AI flow, template tokens |
| [F3 — Sending Engine](../F3-sending-engine.md) | State machine, send sequence, pause/resume, reconnect |
| [F4 — Failure & Retry](../F4-failure-retry.md) | retryCount, auto-retry, skip, manual retry |
| [F5 — Run Summary](../F5-run-summary.md) | Post-run totals + failed list + retry all |
| [F6 — Settings](../F6-settings.md) | Delays, retries, prompt template, clear data |
| [02 — Design System](02-design-system.md) | Visual language "Queue" — tokens, components, screen mockups (Figma replacement) |
