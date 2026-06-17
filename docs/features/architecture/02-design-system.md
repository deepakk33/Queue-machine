# 02 — Design System ("Queue")

The product's visual language lives as a standalone design system in [docs/design-prototype/](../../design-prototype/) — it **replaces a Figma file** (none was ever provided). Authored from the two root specs, it is the source of truth for look-and-feel: tokens, type, color, status system, components, and full HTML/CSS mockups of all five side-panel screens. Start at [readme.md](../../design-prototype/readme.md); it is also a user-invocable Agent Skill ([SKILL.md](../../design-prototype/SKILL.md), `linkedin-dm-queue-design`).

## Direction

A calm, precise **operations console** — power-user automation, trustworthy and legible, never flashy. Hairline borders carry structure; color is reserved almost entirely for the five status states and the single purple primary action. Monospace numerals make timers/counts/IDs/log read instrument-like. Whole UI is one fixed **360px** side-panel column.

## Foundations (tokens)

CSS custom properties in [tokens/](../../design-prototype/tokens/); single entry point is [styles.css](../../design-prototype/styles.css). Full token list in [_ds_manifest.json](../../design-prototype/_ds_manifest.json).

| Axis | Decision |
|---|---|
| **Color — neutral** | Warm **stone** ramp (taupe greys) on cream ground `--bg-app #faf9f5`; pure-white cards `--surface-card`. Text warm near-black `--text-strong #1b1915`. |
| **Color — accent** | Single **dusty purple** `--accent #8f6ccb` for primary action + links, used sparingly. |
| **Color — status** | `pending`=stone · `sending`=indigo (`--sky-*`) · `sent`=emerald · `failed`=terracotta red · `skipped`=amber. Each has `bg`/`fg`/`dot` tokens (`--status-*`). Log lines: `--log-info/success/error/warning`. |
| **Type** | **Fraunces** (serif) for display/titles; **IBM Plex Sans** for UI/body; **IBM Plex Mono** for data (timers, counts, IDs, URLs, log). Tight scale: 11.5px caption → 13.5px body → 24px run counters. |
| **Spacing** | 4px grid; panel gutter 14px; row min-height 44px; header 48px. `--panel-width 360px`. |
| **Radius** | 6px controls/badges, 8px cards/menus, 10px panels/prospect cards, 14px dialogs; pill only for badges/dot/avatars. |
| **Shadow** | Soft warm-tinted `xs→lg`; borders first, shadows rare. Focus = 3px translucent purple ring. |
| **Motion** | 120ms hovers/press (`scale(0.97)`), 180ms menus/toasts; the only loops are the `sending` dot pulse + countdown tick. Respect `prefers-reduced-motion`. |
| **Icons** | [Lucide](https://lucide.dev) line icons, 1.75 stroke, 16–18px, `currentColor`. No emoji. |
| **Copy** | Sentence case; status words lowercase; verbs on buttons; numbers monospace with `·` middot separators. |

## Components

React primitives in [components/](../../design-prototype/components/), each with `.jsx` + `.d.ts` (prop contract) + `.prompt.md`:

- **core/** — `Button` (primary/secondary/ghost/danger), `IconButton`
- **forms/** — `Input`, `Textarea` (with counter), `Switch`
- **feedback/** — `StatusBadge` (the five pills), `ProgressBar`, `Toast`, `Dialog`
- **data/** — `ProspectCard` (queue row with status + message preview)

## Screens (modules)

Standalone HTML/CSS mockups in [screens/](../../design-prototype/screens/) on the tokens, shared chrome in [panel.css](../../design-prototype/screens/panel.css):

| Screen | Maps to feature |
|---|---|
| [queue.html](../../design-prototype/screens/queue.html) | [F1 Prospect Queue](../F1-prospect-queue.md) |
| [add-prospect.html](../../design-prototype/screens/add-prospect.html) | [F2 Message Composition](../F2-message-composition.md) |
| [send-progress.html](../../design-prototype/screens/send-progress.html) | [F3 Sending Engine](../F3-sending-engine.md) |
| [run-summary.html](../../design-prototype/screens/run-summary.html) | [F4 Failure & Retry](../F4-failure-retry.md) · [F5 Run Summary](../F5-run-summary.md) |
| [settings.html](../../design-prototype/screens/settings.html) | [F6 Settings](../F6-settings.md) |
| [index.html](../../design-prototype/screens/index.html) | all five side by side |

## ✅ Built UI now follows the design system

The scaffold ([src/sidepanel/](../../../src/sidepanel/)) has been restyled to "Queue". How the tokens map into the build:

1. **Tokens → Tailwind.** All token values are ported into [tailwind.config.js](../../../tailwind.config.js) `theme.extend` as literal values: the warm `stone` ramp (0–900), the dusty `purple` accent (50–700), the four status ramps (`sky`/`emerald`/`red`/`amber`), semantic aliases (`app`, `surface-*`, `accent-*`), `fontFamily` (display/sans/mono), the compact `fontSize` scale (2xs–3xl), `borderRadius`, slate-tinted `boxShadow`, and the `dmq-pulse`/`dmq-pop`/`dmq-fade` keyframes.
2. **Fonts** are self-hosted via `@fontsource/{fraunces,ibm-plex-sans,ibm-plex-mono}` imported in [main.tsx](../../../src/sidepanel/main.tsx) (bundled, no remote load → MV3-CSP safe), with base wiring in [index.css](../../../src/sidepanel/index.css) (`.mono` = IBM Plex Mono + tabular numerals).
3. **Status colors** in [constants.ts](../../../src/shared/constants.ts) (`STATUS_COLORS`) use the stone/indigo/emerald/red/amber system with `bg`/`text`/`dot` classes; `StatusBadge` renders the dot (pulses on `sending`).
4. **Components & views** are rebuilt against the prototype screens/cards. New primitives mirror the design system: `Button`, `IconButton`, `Switch`, `Stepper`, `Wordmark` (the three-bar mark), alongside restyled `StatusBadge`/`ProspectCard`/`ProgressBar`/`Toast`/`ConfirmDialog`.
5. **Icons** come from `lucide-react`. (The extension toolbar PNGs in `public/icons/` are still placeholders — redrawing them to the wordmark is the one remaining cosmetic gap.)
