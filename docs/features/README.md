# Feature Docs — LinkedIn DM Queue

Per-feature documentation for the LinkedIn DM Queue Chrome extension. The canonical spec is the two root docs ([requirements](../../linkedin-dm-queue-requirements.md), [technical design](../../linkedin-dm-queue-technical-design.md)); these feature docs summarize and cross-link them per feature.

## Index

| Doc | Covers |
|---|---|
| [architecture/01-system-overview.md](architecture/01-system-overview.md) | Contexts (side panel / service worker / content script), data tier, message flow, risks |
| [architecture/02-design-system.md](architecture/02-design-system.md) | Design system "Queue" — tokens, color/type/status, components, screen mockups (replaces Figma); divergence vs. built UI |
| [F1 — Prospect Queue](F1-prospect-queue.md) | Add/edit/delete, persistence, status, filter, reorder |
| [F2 — Message Composition](F2-message-composition.md) | Copy Context / Paste Message clipboard AI flow, template tokens |
| [F3 — Sending Engine](F3-sending-engine.md) | State machine, send sequence, pause/resume, reconnect |
| [F4 — Failure & Retry](F4-failure-retry.md) | retryCount, auto-retry, skip, manual retry |
| [F5 — Run Summary](F5-run-summary.md) | Post-run totals + failed list + retry all |
| [F6 — Settings](F6-settings.md) | Delays, retries, prompt template, clear data |

## Doc conventions

**Document every feature here.** When you add or change a feature, create/update its `FX-*.md` doc and add it to this index.

**Adapted 6-section template — NEVER deviate from the order:**

1. **Overview** — purpose and scope
2. **Sub-features** — numbered list, mapped to AC numbers where useful
3. **Data model** — relevant `Prospect`/`Settings` fields; link technical-design §4-5
4. **Messaging / flow** — `chrome.runtime` message types + sequence; link technical-design §6-9
5. **UI components** — side-panel views/components involved
6. **Edge cases / empty states / error states**

No RBAC matrix (single-user extension, no roles). **Design references are now expected** — §5 of each feature doc links its matching screen + components in the [design system](architecture/02-design-system.md) ([docs/design-prototype/](../design-prototype/), which replaces a Figma file).

## Glossary

- **Prospect** — one queued recipient record (name, profileUrl, message, status, …).
- **Queue** — the ordered set of prospects in IndexedDB.
- **Surface** — which LinkedIn UI is loaded: Sales Navigator (primary) or regular LinkedIn (fallback).
- **Composer** — LinkedIn's message modal (contenteditable input + send button).
- **Send run** — one execution of the send engine over all eligible pending prospects.
- **Eligible** — `status === pending` with a non-empty `message`.
