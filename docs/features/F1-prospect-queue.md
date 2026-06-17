# F1 — Prospect Queue

> v1 · personal-use Chrome extension

## 1. Overview

The local prospect queue is the core data store. User manually adds prospects one at a time via a side-panel form; each holds structured fields used for messaging and AI context. The queue persists in IndexedDB across browser restarts and drives every other feature (compose, send, retry, summary). No CSV import in v1 (deferred to v2 — requirements §12).

## 2. Sub-features

- **2.1 Add prospect** — form with name, profileUrl (both required), designation, company, companyUrl, notes (AC-1).
- **2.2 Edit prospect** — edit any field of an existing prospect (AC-2).
- **2.3 Delete prospect** — remove a single prospect (AC-3).
- **2.4 Bulk clear** — delete all prospects behind a confirmation dialog (AC-4).
- **2.5 Persistence** — queue survives browser restart via IndexedDB (AC-5).
- **2.6 Status badge** — each row shows a color-coded status (AC-6).
- **2.7 Filter by status** — all / pending / sent / failed / skipped (AC-7, Should).
- **2.8 Reorder** — drag-and-drop ordering (AC-8, Nice-to-have; backed by `order` field).

## 3. Data model

`Prospect` record (technical-design §4.1, requirements §5.1). Key fields:

| Field | Type | Notes |
|---|---|---|
| `id` | string | `crypto.randomUUID()` |
| `name`, `profileUrl` | string | required |
| `designation`, `company`, `companyUrl`, `notes` | string | optional context |
| `message` | string | composed message (see [F2](F2-message-composition.md)) |
| `status` | enum | `pending · sending · sent · failed · skipped` |
| `failureReason`, `retryCount`, `lastAttemptAt`, `sentAt`, `createdAt` | auto | see [F4](F4-failure-retry.md) |
| `order` | number | queue position for sorting/reorder |

Dexie table: `prospects: "id, status, createdAt, order"` (indexed fields). CRUD helpers in `src/db/prospects.ts` — `addProspect`, `updateProspect`, `deleteProspect`, `clearAllProspects`, `getProspectsByStatus` (technical-design §5.2).

## 4. Messaging / flow

Prospect CRUD is local to the side panel — no cross-context messaging. Side panel writes directly to Dexie via `src/db/prospects.ts`, surfaced through the `useQueue` hook / `queue-store` (Zustand). Status changes during a send run arrive from the service worker as `PROSPECT_STATUS_CHANGED` (see [F3](F3-sending-engine.md)).

## 5. UI components

- `views/QueueView.tsx` — scrollable list, top-bar actions (Add, Start Sending, Settings), status filter/sort.
- `views/ProspectForm.tsx` — add/edit form (also hosts [F2](F2-message-composition.md) Copy/Paste buttons).
- `components/ProspectCard.tsx` — single row: name, company, status badge, truncated message preview ("No message" when empty).
- `components/StatusBadge.tsx`, `components/ConfirmDialog.tsx` (bulk clear).

**Design reference** ([design system](architecture/02-design-system.md)): screen [queue.html](../design-prototype/screens/queue.html); components [ProspectCard](../design-prototype/components/data/ProspectCard.jsx), [StatusBadge](../design-prototype/components/feedback/StatusBadge.jsx), [Button](../design-prototype/components/core/Button.jsx)/[IconButton](../design-prototype/components/core/IconButton.jsx), [Dialog](../design-prototype/components/feedback/Dialog.jsx) (bulk clear), [Input](../design-prototype/components/forms/Input.jsx) (filter).

## 6. Edge cases / empty states / error states

- Empty queue → QueueView shows an empty state prompting "Add Prospect".
- Required-field validation: name + profileUrl must be non-empty before save.
- Bulk clear is destructive → confirmation dialog required (AC-4).
- Row with no message shows muted "No message" and is excluded from "Start Sending" eligibility (see [F3](F3-sending-engine.md), AC-15).
- Editing a prospect mid-send run: in-flight item should not be edited; UI may disable edit for the `sending` item.
