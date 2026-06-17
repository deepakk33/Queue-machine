# F6 — Settings

> v1 · personal-use Chrome extension

## 1. Overview

A settings view lets the user tune send pacing (delay range), retry behavior, and the AI prompt template, plus clear all data. Settings persist in IndexedDB across browser restarts and are read by the send engine ([F3](F3-sending-engine.md)/[F4](F4-failure-retry.md)) and the compose flow ([F2](F2-message-composition.md)).

## 2. Sub-features

- **2.1 Delay range** — set `minDelay` / `maxDelay` in seconds (AC-35).
- **2.2 Max retries** — set `maxRetries`, 0 = no retries (AC-36).
- **2.3 Auto-retry toggle** — on/off (AC-37).
- **2.4 Prompt template editor** — edit `promptTemplate` with token reference (AC-38, see [F2](F2-message-composition.md)).
- **2.5 Persistence** — settings survive restart (AC-39).
- **2.6 Clear all data** — destructive reset behind confirmation (requirements §7.1.E).

## 3. Data model

`Settings` (technical-design §4.1, §10): `minDelay` (60), `maxDelay` (120), `maxRetries` (2), `autoRetry` (true), `promptTemplate` (default in §10), `pageLoadTimeout` (15), `elementTimeout` (10). Dexie table `settings: "id"`, single row keyed `"default"`; falls back to `DEFAULT_SETTINGS` when unset.

## 4. Messaging / flow

Side-panel local read/write via `src/db/settings.ts` + `useSettings` hook / `settings-store` (Zustand). The send engine reads settings on demand inside `getSettings()` (technical-design §6.2) — so changes apply to the next send/delay without restart. "Clear All Data" calls `clearAllProspects()` ([F1](F1-prospect-queue.md)) and resets settings.

## 5. UI components

- `views/SettingsView.tsx` — delay min/max inputs, max-retries input, auto-retry toggle, prompt-template `<textarea>` with token reference, "Clear All Data" button.
- `components/ConfirmDialog.tsx` — clear-data confirmation.

**Design reference** ([design system](architecture/02-design-system.md)): screen [settings.html](../design-prototype/screens/settings.html); components [Input](../design-prototype/components/forms/Input.jsx) (delays/retries), [Switch](../design-prototype/components/forms/Switch.jsx) (auto-retry), [Textarea](../design-prototype/components/forms/Textarea.jsx) (prompt template), [Dialog](../design-prototype/components/feedback/Dialog.jsx) (danger confirm: "Clear all data? …cannot be undone."), [Button](../design-prototype/components/core/Button.jsx) (danger variant).

## 6. Edge cases / empty states / error states

- `minDelay > maxDelay` → validate/swap or clamp before save.
- `maxRetries: 0` → disables auto-retry path regardless of toggle ([F4](F4-failure-retry.md)).
- Template edited to remove tokens → compose still works; only mapped tokens substitute ([F2](F2-message-composition.md)).
- "Clear All Data" is destructive → confirmation required; blocked or warned during an active run.
- Missing settings row → `DEFAULT_SETTINGS` used (technical-design §6.2).
