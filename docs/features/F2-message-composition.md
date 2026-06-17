# F2 — Message Composition (Clipboard AI Flow)

> v1 · personal-use Chrome extension

## 1. Overview

Messages are composed manually or via an AI-assisted clipboard loop. The user clicks **Copy Context** to put a filled prompt template on the clipboard, pastes it into Claude.ai (or any open AI chat), copies the generated message, returns, and clicks **Paste Message** to fill the prospect's `message` field. The field is also freely editable. Fully automating this loop is Phase 2 (requirements §3.2) and out of scope for v1.

## 2. Sub-features

- **2.1 Copy Context** — render the prompt template with this prospect's data and copy to clipboard (AC-9); toast confirms success (AC-10).
- **2.2 Paste Message** — read clipboard and populate the message textarea (AC-11).
- **2.3 Manual edit** — type/edit the message directly (AC-12).
- **2.4 Editable template** — prompt template lives in settings with token placeholders (AC-13, see [F6](F6-settings.md)).
- **2.5 Safe token replacement** — missing fields render as empty string, never leave raw `{{token}}` in output (AC-14).

## 3. Data model

- Writes the `message` field on the `Prospect` record (see [F1](F1-prospect-queue.md)).
- Reads `promptTemplate` from `Settings` (see [F6](F6-settings.md)).

Default template (technical-design §10, requirements §5.3) — tokens: `{{name}}`, `{{designation}}`, `{{company}}`, `{{companyUrl}}`, `{{profileUrl}}`, `{{notes}}`.

## 4. Messaging / flow

No cross-context messaging — entirely side-panel local.

- `src/utils/template.ts` — `renderTemplate(template, prospect)` via `TOKEN_MAP`; uses `replaceAll`, coerces non-strings to `""`, trims (technical-design §9.1).
- `src/utils/clipboard.ts` — `copyToClipboard(text)` (navigator.clipboard → `document.execCommand` fallback) and `readFromClipboard()` (technical-design §9.2).

Loop: select prospect → Copy Context → (external AI tab) → Paste Message → message saved on prospect.

## 5. UI components

- `views/ProspectForm.tsx` — "Copy Context" + "Paste Message" buttons, message `<textarea>`.
- `components/Toast.tsx` — clipboard confirmation toast.

**Design reference** ([design system](architecture/02-design-system.md)): screen [add-prospect.html](../design-prototype/screens/add-prospect.html); components [Input](../design-prototype/components/forms/Input.jsx), [Textarea](../design-prototype/components/forms/Textarea.jsx) (with counter), [Button](../design-prototype/components/core/Button.jsx) (Copy Context / Paste Message), [Toast](../design-prototype/components/feedback/Toast.jsx).

## 6. Edge cases / empty states / error states

- Clipboard API blocked → fall back to `execCommand`; if both fail, surface an error toast (clipboard returns `false` / `null`).
- Empty optional fields → token becomes empty string, no broken tokens (AC-14).
- Paste with empty/irrelevant clipboard → still populates textarea; user can clear/edit.
- Custom template missing tokens → only present tokens are replaced; unknown `{{x}}` left as-is (only mapped tokens in `TOKEN_MAP` are substituted).
