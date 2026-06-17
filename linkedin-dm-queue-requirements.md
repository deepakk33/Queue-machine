# LinkedIn DM Queue — Chrome Extension

## Product Requirements Document

---

## 1. Overview

A Chrome extension (Manifest V3) that acts as a personal outbound command center for LinkedIn Sales Navigator. The tool lets the user build a prospect queue, compose or paste messages (with a manual AI-assisted workflow via clipboard), and fire off messages one by one through the Sales Navigator UI.

This is a personal-use tool. No multi-user support, no cloud sync, no distribution concerns.

---

## 2. Core Concept

**Queue-first message sender, not a scheduler.**

The user loads prospects into a local queue with relevant data fields. Messages are composed manually or by copying prospect context to an AI chat (like Claude), grabbing the generated message, and pasting it back into the tool. When ready, the user hits "Start" and the extension sends messages sequentially through Sales Navigator, with human-like delays between sends.

Scheduling (send at a specific date/time) is **optional and deferred** — the MVP assumes the user is present, laptop open, and initiating sends manually.

---

## 3. User Workflow

### 3.1 Adding Prospects to the Queue

- User manually adds prospects one at a time via a form in the side panel.
- Each prospect entry includes structured fields (see Section 5).
- No CSV import in v1. CSV support will be added later when email scheduling is introduced.

### 3.2 Composing Messages (Manual + AI-Assisted Clipboard Flow)

**Phase 1 (MVP):**
1. User selects a prospect in the queue.
2. Clicks a "Copy Context" button — this copies the prospect's data (name, title, company, notes, etc.) to the clipboard in a pre-formatted prompt template.
3. User switches to Claude.ai (or any AI chat already open in another tab), pastes the context, and gets a generated message.
4. User copies the AI-generated message.
5. Switches back to the extension side panel and clicks "Paste Message" or manually pastes the message into the prospect's message field.

**Phase 2 (Future):**
- Automate this loop: extension opens the AI chat tab, injects the prompt via clipboard/paste, waits for the response, and pulls the generated message back into the queue automatically.

### 3.3 Sending Messages

1. User reviews the queue — each item should have a filled message before sending.
2. Clicks "Start Sending."
3. The extension processes the queue sequentially:
   - Opens the prospect's LinkedIn/Sales Navigator profile URL in the active tab (or a new tab).
   - Waits for the page to load.
   - Locates the "Message" button and opens the composer.
   - Pastes the message into the composer input field.
   - Clicks "Send."
   - Updates the queue item status.
   - Waits a randomized delay before moving to the next item.
4. User can pause/resume at any point.

### 3.4 Post-Send Review

- Queue persists after sending with statuses (sent, failed, pending, skipped).
- User can manually retry failed items individually or in bulk.

---

## 4. Extension Architecture

### 4.1 UI Surface: Chrome Side Panel

- Use `chrome.sidePanel` API (MV3).
- Side panel stays open while the user browses Sales Navigator, unlike a popup which closes on blur.
- The entire queue management UI lives in the side panel.

### 4.2 Content Script

- Injected into `linkedin.com` and `*.linkedin.com` pages.
- Handles all DOM interaction: finding the message button, opening the composer, pasting text, clicking send.
- Uses `MutationObserver` to wait for dynamically loaded elements.
- Communicates with the side panel and background service worker via `chrome.runtime.sendMessage`.

### 4.3 Background Service Worker

- Manages the send loop state machine.
- Handles tab navigation (opening prospect profile URLs).
- Coordinates between the side panel UI and the content script.
- Manages retry logic and delay timers.

---

## 5. Data Model

### 5.1 Prospect Record

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (UUID) | Auto | Unique identifier |
| `name` | string | Yes | Prospect's full name |
| `profileUrl` | string | Yes | LinkedIn or Sales Navigator profile URL |
| `designation` | string | No | Job title / role |
| `company` | string | No | Company name |
| `companyUrl` | string | No | Company website (useful for AI context) |
| `notes` | string | No | Free-text notes, pain points, trigger events, or any custom context for message personalization |
| `message` | string | No | The composed message to be sent (empty until filled manually or via AI) |
| `status` | enum | Auto | `pending` · `sending` · `sent` · `failed` · `skipped` |
| `failureReason` | string | Auto | Populated on failure (e.g., "Composer not found", "Profile page did not load", "Send button not clickable") |
| `retryCount` | number | Auto | Number of times this item has been retried (default: 0) |
| `lastAttemptAt` | timestamp | Auto | Timestamp of the last send attempt |
| `sentAt` | timestamp | Auto | Timestamp of successful send |
| `createdAt` | timestamp | Auto | When the prospect was added to the queue |

### 5.2 Settings / Config

| Field | Type | Default | Description |
|---|---|---|---|
| `minDelay` | number (seconds) | 60 | Minimum delay between sends |
| `maxDelay` | number (seconds) | 120 | Maximum delay between sends |
| `maxRetries` | number | 2 | Maximum auto-retry attempts per prospect |
| `autoRetry` | boolean | true | Whether to auto-retry failed items during a send run |
| `promptTemplate` | string | (see below) | Template used when "Copy Context" is clicked |

### 5.3 Default Prompt Template

Used by the "Copy Context" button. Tokens are replaced with actual prospect data before copying to clipboard.

```
Write a personalized LinkedIn InMail for the following prospect. Keep it under 500 characters including spaces. Make it conversational, skimmable, and direct. No dashes. No fluff.

Name: {{name}}
Title: {{designation}}
Company: {{company}}
Company Website: {{companyUrl}}
Notes: {{notes}}
```

The user should be able to edit this template in settings.

---

## 6. Sending Engine — State Machine

### 6.1 States

```
IDLE → RUNNING → SENDING → WAITING → RUNNING → ... → COMPLETED
                    ↓
                  FAILED → RETRYING → SENDING
                    ↓
                  SKIPPED (max retries exceeded)
```

### 6.2 Send Sequence (per prospect)

1. **Navigate**: Open the prospect's `profileUrl` in the active tab.
2. **Wait for load**: Use content script + MutationObserver to confirm the profile page has fully rendered. Timeout after 15 seconds → mark as failed ("Page did not load").
3. **Find Message button**: Locate the "Message" button on the profile. If not found within 10 seconds → mark as failed ("Message button not found").
4. **Open composer**: Click the message button. Wait for the composer modal/panel to appear. Timeout after 10 seconds → mark as failed ("Composer did not open").
5. **Paste message**: Set the message text in the composer input. LinkedIn uses a contenteditable div, so dispatch appropriate input/change events to trigger their internal state updates.
6. **Send**: Click the send button. Confirm the message was sent (composer closes or success indicator appears). Timeout after 10 seconds → mark as failed ("Send confirmation not received").
7. **Update status**: Mark as `sent` with timestamp.
8. **Delay**: Wait a random duration between `minDelay` and `maxDelay` seconds.
9. **Next**: Move to the next `pending` item in the queue.

### 6.3 Failure Handling

- On failure, increment `retryCount` and log the `failureReason`.
- If `autoRetry` is enabled and `retryCount < maxRetries`, push the item back into the queue (at the end or immediately re-attempt — configurable).
- If `retryCount >= maxRetries`, mark as `skipped`.
- After a complete send run finishes, show a summary: X sent, Y failed, Z skipped.
- User can manually retry any `failed` or `skipped` item at any time via a "Retry" button on each queue item.

### 6.4 Pause / Resume

- User can click "Pause" at any time during a send run.
- The current in-flight message completes (no mid-send interruption), then the loop halts.
- "Resume" picks up from the next `pending` item.
- Closing the side panel does NOT cancel the run — the background service worker continues. The side panel reconnects to the current state when reopened.

---

## 7. UI Specification (Side Panel)

### 7.1 Screens / Views

**A. Queue View (Default)**
- A scrollable list of all prospects in the queue.
- Each row shows: name, company, status badge, and a truncated preview of the message (or "No message" in muted text).
- Clicking a row expands it inline or opens a detail/edit view.
- Top bar actions: "Add Prospect" button, "Start Sending" button (disabled if no pending items with messages), "Settings" gear icon.
- Filter/sort: filter by status (all, pending, sent, failed, skipped), sort by added date.

**B. Add / Edit Prospect View**
- Form with all fields from Section 5.1 (except auto-generated ones).
- "Copy Context" button — copies the filled prompt template to clipboard and shows a toast confirmation.
- "Paste Message" button — reads clipboard content and populates the message field.
- Message field is a textarea, manually editable.
- "Save" and "Cancel" buttons.

**C. Send Progress View**
- Shown when a send run is active.
- Live counter: "Sending 4 of 12..."
- Current prospect name and status.
- Progress bar.
- Pause / Stop buttons.
- Real-time log of actions: "Opened profile for [Name]... Message sent. Waiting 73s..."

**D. Run Summary View**
- Displayed after a send run completes.
- Counts: total, sent, failed, skipped.
- List of failed/skipped items with reasons.
- "Retry All Failed" button.

**E. Settings View**
- Delay range (min/max sliders or number inputs).
- Max retries.
- Auto-retry toggle.
- Prompt template editor (textarea with token reference).
- "Clear All Data" button with confirmation.

### 7.2 Design Tokens

- Use Tailwind CSS utility classes.
- Neutral, minimal UI. No heavy branding.
- Status badge colors: pending (gray), sending (blue/pulse), sent (green), failed (red), skipped (amber).
- Compact layout — side panel is narrow (~360px), so the UI must work in that width.

---

## 8. Technical Stack

| Layer | Technology | Notes |
|---|---|---|
| Extension framework | Chrome Manifest V3 | Side panel API, content scripts, service worker |
| UI framework | React 18 | Functional components, hooks |
| State management | Zustand | Lightweight, works well in extension contexts |
| Styling | Tailwind CSS | Utility-first, easy to keep compact |
| Local storage | Dexie.js (IndexedDB) | Better than chrome.storage.local for structured data and larger datasets. No 10MB cap. |
| Build tooling | Vite + CRXJS | CRXJS Vite plugin for hot reload during extension development |
| DOM interaction | Vanilla JS in content scripts | MutationObserver for dynamic element detection |
| Unique IDs | `crypto.randomUUID()` | Built-in, no dependency needed |

---

## 9. Manifest V3 Permissions

```json
{
  "manifest_version": 3,
  "permissions": [
    "sidePanel",
    "activeTab",
    "tabs",
    "scripting",
    "storage",
    "clipboardRead",
    "clipboardWrite",
    "alarms"
  ],
  "host_permissions": [
    "https://www.linkedin.com/*",
    "https://linkedin.com/*"
  ],
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "content_scripts": [
    {
      "matches": ["https://www.linkedin.com/*", "https://linkedin.com/*"],
      "js": ["content-script.js"]
    }
  ],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  }
}
```

---

## 10. File / Folder Structure

```
linkedin-dm-queue/
├── public/
│   └── icons/                  # Extension icons (16, 48, 128)
├── src/
│   ├── background/
│   │   ├── index.ts            # Service worker entry
│   │   └── send-engine.ts      # State machine for send loop
│   ├── content/
│   │   ├── index.ts            # Content script entry
│   │   ├── dom-actions.ts      # Profile page DOM interactions (find message btn, open composer, paste, send)
│   │   └── dom-selectors.ts    # Centralized selector definitions (easy to update when LinkedIn changes DOM)
│   ├── sidepanel/
│   │   ├── index.html          # Side panel HTML entry
│   │   ├── App.tsx             # Root React component
│   │   ├── views/
│   │   │   ├── QueueView.tsx
│   │   │   ├── ProspectForm.tsx
│   │   │   ├── SendProgress.tsx
│   │   │   ├── RunSummary.tsx
│   │   │   └── SettingsView.tsx
│   │   ├── components/
│   │   │   ├── ProspectCard.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── ProgressBar.tsx
│   │   └── store/
│   │       ├── queue-store.ts   # Zustand store for prospect queue
│   │       └── settings-store.ts
│   ├── shared/
│   │   ├── types.ts            # TypeScript interfaces (Prospect, Settings, SendState)
│   │   ├── constants.ts        # Default values, status enums
│   │   ├── db.ts               # Dexie.js database setup and queries
│   │   └── messages.ts         # Message types for runtime communication between extension parts
│   └── utils/
│       ├── clipboard.ts        # Copy/paste helpers
│       ├── delay.ts            # Random delay generator
│       └── template.ts         # Prompt template token replacement
├── manifest.json
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 11. Acceptance Criteria

### 11.1 Prospect Management

| # | Criteria | Priority |
|---|---|---|
| AC-1 | User can add a new prospect with name, profile URL, designation, company, company URL, and notes. | Must |
| AC-2 | User can edit any field of an existing prospect. | Must |
| AC-3 | User can delete a prospect from the queue. | Must |
| AC-4 | User can delete all prospects (bulk clear) with a confirmation dialog. | Must |
| AC-5 | Queue persists across browser restarts (IndexedDB). | Must |
| AC-6 | Each prospect displays its current status with a color-coded badge. | Must |
| AC-7 | User can filter the queue by status (all, pending, sent, failed, skipped). | Should |
| AC-8 | User can reorder prospects in the queue via drag-and-drop. | Nice to have |

### 11.2 Message Composition (Clipboard AI Flow)

| # | Criteria | Priority |
|---|---|---|
| AC-9 | Clicking "Copy Context" copies the prospect's data to the clipboard using the prompt template. | Must |
| AC-10 | A toast notification confirms successful clipboard copy. | Must |
| AC-11 | Clicking "Paste Message" reads the clipboard and populates the message textarea. | Must |
| AC-12 | User can manually type or edit the message in the textarea. | Must |
| AC-13 | The prompt template is editable in settings with token placeholders. | Must |
| AC-14 | If a required field (e.g., name) is empty, the token is replaced with an empty string (no broken tokens in copied text). | Must |

### 11.3 Sending Engine

| # | Criteria | Priority |
|---|---|---|
| AC-15 | "Start Sending" is disabled if no prospects have status `pending` with a non-empty message. | Must |
| AC-16 | Extension navigates to each prospect's profile URL sequentially. | Must |
| AC-17 | Extension waits for the profile page to fully load before acting. | Must |
| AC-18 | Extension locates the message button, opens the composer, pastes the message, and clicks send. | Must |
| AC-19 | Each step has a timeout (configurable, default 10-15s) — if exceeded, the item is marked as `failed` with a reason. | Must |
| AC-20 | A randomized delay (between minDelay and maxDelay) is applied between each send. | Must |
| AC-21 | The send loop continues automatically through all pending items until the queue is exhausted. | Must |
| AC-22 | User can pause the send loop — current in-flight message completes, then the loop halts. | Must |
| AC-23 | User can resume the send loop from where it was paused. | Must |
| AC-24 | Closing the side panel does not cancel an active send run. | Must |
| AC-25 | Reopening the side panel reconnects to the active run's state (progress, current item). | Must |

### 11.4 Failure and Retry

| # | Criteria | Priority |
|---|---|---|
| AC-26 | On failure, `retryCount` is incremented and `failureReason` is logged on the prospect. | Must |
| AC-27 | If auto-retry is on and retries are under the max, the item is re-queued at the end of the pending list. | Must |
| AC-28 | If retries are exhausted, the item is marked as `skipped`. | Must |
| AC-29 | User can manually retry any individual failed or skipped item via a "Retry" button. | Must |
| AC-30 | User can "Retry All Failed" from the run summary view. | Must |
| AC-31 | Each retry resets the failure reason and re-runs the full send sequence. | Must |

### 11.5 Post-Run Summary

| # | Criteria | Priority |
|---|---|---|
| AC-32 | After a send run completes, a summary screen shows totals: sent, failed, skipped. | Must |
| AC-33 | Failed/skipped items are listed with their failure reasons. | Must |
| AC-34 | User can navigate from the summary back to the full queue view. | Must |

### 11.6 Settings

| # | Criteria | Priority |
|---|---|---|
| AC-35 | User can set min and max delay (in seconds) for between-send pauses. | Must |
| AC-36 | User can set the max retry count (0 = no retries). | Must |
| AC-37 | User can toggle auto-retry on/off. | Must |
| AC-38 | User can edit the prompt template with token reference. | Must |
| AC-39 | Settings persist across browser restarts. | Must |

---

## 12. Out of Scope (v1)

These are explicitly deferred:

- CSV import/export (planned for v2 when email scheduling is added).
- Automated AI message generation (Phase 2 — auto-paste into Claude and grab response).
- Scheduling sends for a future date/time.
- Email sending or any channel beyond LinkedIn.
- Multi-user / cloud sync / authentication.
- Chrome Web Store distribution.
- Connection request sending (only InMails / direct messages).
- Analytics or reporting beyond the post-run summary.

---

## 13. Risks and Known Limitations

| Risk | Impact | Mitigation |
|---|---|---|
| LinkedIn DOM changes frequently | Content script selectors break, sending fails | Centralize selectors in `dom-selectors.ts` for quick updates. Use resilient selector strategies (data attributes > aria > structural). |
| LinkedIn bot detection | Account restrictions or bans | Randomized delays, human-like interaction patterns. Personal use only reduces risk. |
| Service worker inactivity | Chrome may kill the service worker mid-run | Use `chrome.alarms` API to keep the worker alive during active send runs. Persist send state to IndexedDB so it can recover. |
| Clipboard permissions | Browser may block clipboard access in some contexts | Use `navigator.clipboard` API with proper permissions. Fallback to `document.execCommand` if needed. |
| Sales Navigator vs regular LinkedIn | Different DOM structures | Initially target one (Sales Navigator). Add regular LinkedIn support later if needed. Content script should detect which version is loaded. |

---

## 14. Future Roadmap (Post-v1)

1. **Automated AI message flow**: Extension auto-injects prospect context into Claude tab, waits for response, pulls message back.
2. **CSV import**: Bulk load prospects from a CSV file.
3. **Email channel**: Extend the queue to support email sends (via Gmail API or SMTP).
4. **Scheduling**: Schedule sends for specific dates/times (requires persistent background processing).
5. **Connection request support**: Send connection requests with a note (in addition to InMails).
6. **Message templates library**: Save and reuse message templates with token support.
7. **Export**: Export queue data with statuses as CSV for record-keeping.
