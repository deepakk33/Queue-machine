# LinkedIn DM Queue — Design System

A focused design system for **LinkedIn DM Queue**, a personal-use Chrome extension (Manifest V3) that acts as an outbound command center for LinkedIn Sales Navigator. The user builds a queue of prospects, composes messages (manually or via a clipboard-based AI workflow), and fires them off sequentially through the Sales Navigator UI with human-like delays, pause/resume, retries, and a post-run summary.

The entire product UI lives in a **Chrome Side Panel ~360px wide**. Everything here is tuned for that narrow, dense, single-column surface.

---

## Sources

This system was authored from two written specs supplied by the product owner:

- **Technical Design Document** — system architecture (side panel ⇄ service worker ⇄ content script), tech stack (React 18, Zustand, Tailwind CSS, Dexie.js/IndexedDB, TypeScript, Vite + CRXJS), TypeScript interfaces, Dexie schema, the send-engine state machine, content-script DOM layer, and the MV3 manifest.
- **Product Requirements Document** — the queue-first concept, user workflow, data model, sending engine states, UI specification (five views), and acceptance criteria.

No existing codebase, Figma file, or prior brand was provided. The PRD asks for a *"neutral, minimal UI, no heavy branding."* This system gives that intent a concrete, opinionated form. **If you have brand assets, fonts, or an existing extension build, share them and the foundations below should be re-pointed at the real thing.**

---

## The product in one paragraph

It is a *queue*, not a scheduler. The user is present, laptop open. They load prospects (name, profile URL, title, company, notes), get a message onto each one, press **Start Sending**, and watch a live progress feed as the engine walks the queue: navigate → wait for load → find Message button → open composer → paste → send → wait a randomized 60–120s → next. Statuses are the heartbeat of the whole UI: **pending · sending · sent · failed · skipped**.

---

## Design direction — "Queue"

A calm, precise **operations console**. The tone is power-user automation: trustworthy, legible, slightly technical — never flashy or consumer-cute. Hairline borders carry the structure; color is reserved almost entirely for the five status states and the single purple primary action. Monospace numerals make timers, counts, IDs and the activity log feel instrument-like.

---

## CONTENT FUNDAMENTALS

How copy is written in this product:

- **Voice: direct, operational, second person implied.** The UI talks in plain imperatives and short status statements. Buttons are verbs: *Start Sending, Pause, Resume, Retry, Copy Context, Paste Message, Save, Clear All Data.* No marketing voice, no exclamation points.
- **Sentence case everywhere.** Buttons, labels, headings, menu items — all sentence case (*"Start sending"*, not "Start Sending" as Title Case and not ALL CAPS). The only uppercase is the occasional micro-eyebrow label (e.g. `ACTIVITY`, `FAILED ITEMS`) set in tracked small caps.
- **Status words are lowercase nouns:** pending, sending, sent, failed, skipped. They appear as badge text and in summaries.
- **Numbers are first-class.** Progress reads *"Sending 4 of 12"*. Delays read *"Waiting 73s before next send…"*. Summary reads *"9 sent · 2 failed · 1 skipped"*. Use the `·` middot as a compact separator. Counts and timers are monospace and tabular.
- **The activity log is terse, past/present tense, one line each:** *"Opened profile for Dana Reed", "Message sent", "Waiting 73s…", "Failed: Sam Cole — Composer did not open", "Re-queued for retry (attempt 1)"*. Each line carries a severity: info / success / error / warning.
- **Failure reasons are specific and human-readable**, surfaced verbatim from the engine: *"Page did not load within timeout", "Message button not found", "Composer did not open", "Send button not clickable"*. Never show a raw stack trace.
- **Empty states coach the next action:** *"No prospects yet. Add one to start your queue."* / *"No message" (muted) on a row that still needs one.*
- **Destructive actions are explicit and confirmed:** *"Clear all data? This removes every prospect and cannot be undone."* with a red confirm button labeled *Clear all data*.
- **No emoji.** Iconography is line icons (Lucide). Tone stays professional because the tool operates on a real LinkedIn account where caution matters.
- **Helper text is calm, never alarming**, even for the bot-detection caveat: *"Randomized delays keep sends human-paced."*

---

## VISUAL FOUNDATIONS

**Color.** A warm light theme on a cream ground (`--bg-app`, `#faf9f5`) with pure-white cards (`--surface-card`). Text is a warm near-black stone (`--text-strong` `#1b1915`) rather than pure black, and the whole neutral ramp is a warm **stone** scale (taupe greys) so it sits naturally on cream. A single **dusty purple accent** (`--accent` `#8f6ccb`) marks the primary action and links — used sparingly so it reads as "the thing to press." All other color is **status semantics**: pending = warm stone, sending = indigo, sent = emerald, failed = terracotta red, skipped = amber. Each status has a `bg` (tinted 50), `fg` (700) and `dot` (500) token so badges, dots and log lines stay consistent. Imagery is essentially absent — this is a utility surface, not a marketing one.

**Type.** **Fraunces** (a soft optical-size serif) for display — view titles, the wordmark, "Run complete" — giving the tool an editorial, warm character. **IBM Plex Sans** for all UI/body; **IBM Plex Mono** for data (timestamps, countdowns, counts, IDs, URLs, the log). The scale is deliberately tight for 360px: 11.5px captions, 13.5px body/rows, 15px card titles, 20–22px view titles, 24px for the big run counters. Tracking tightens slightly on larger sizes; uppercase eyebrows get `+0.06em`.

**Spacing.** A 4px grid. Panel horizontal gutter is 14px. Rows have a 44px minimum height (tap target). Density is high but never cramped — `--space-6` (12px) is the default breathing room between stacked controls.

**Backgrounds.** Flat. No gradients, no photos, no patterns, no texture. The only non-flat surfaces are the soft elevation shadows on dropdowns, dialogs and toasts. The sending state may use a subtle blue *pulse* animation on its dot — the one place motion signals "live."

**Borders.** Hairline (`1px`) and they do the heavy structural lifting: `--border-default` (`#e2e8f0`) separates rows and outlines inputs/cards; `--border-subtle` for the lightest dividers; `--border-strong` on hover/focus of inputs. Border-first design keeps shadows rare.

**Shadows.** Soft, low-spread, warm-tinted, four steps (`xs→lg`). Cards in the list use at most `--shadow-xs` plus a border. Real elevation (menus, dialog, toast) uses `--shadow-md`/`--shadow-lg`. Focus is a 3px translucent blue ring (`--shadow-focus`), never a hard outline.

**Radii.** Gentle, friendly, not pill-y: inputs/buttons/badges `6px` (`--radius-sm`), cards/menus `8px`, prospect cards/panels `10px`, dialogs `14px`. Status badges and the sending dot are the only fully-round (`pill`) elements, plus avatars.

**Cards.** White surface, `--radius-lg`, `1px --border-default`, `--shadow-xs`. On hover a prospect card lifts to `--surface-hover`/`--shadow-sm` and reveals row actions. Selected/active gets a `--border-focus` left treatment is avoided — instead the whole border tints blue. (No "colored left-border accent only" cards.)

**Buttons.** Primary = solid `--accent`, white text, `--radius-sm`, `--control-md` (34px). Secondary = white surface + `--border-default`. Ghost = transparent, stone text. Danger = solid red. Hover darkens by one step; **press shrinks** (`scale(0.97)`) and deepens to the `active` token — never a color invert. Disabled drops to 45% opacity and `not-allowed`.

**Animation.** Quick and physical. `--dur-fast` (120ms) for hovers/presses, `--dur-base` (180ms) for menus/toasts, `--ease-out` for entrances. The progress bar fills with `--ease-in-out`. The "sending" pulse and a subtle countdown tick are the only loops. Respect `prefers-reduced-motion`.

**Transparency & blur.** Minimal. Dialog scrim is `rgba(20,26,35,0.45)` with no blur (keeps the side panel cheap to render). Disabled states use opacity. No glassmorphism.

**Layout rules.** Single fixed-width column (`--panel-width` 360px). A sticky 48px header holds the view title + primary action; a sticky footer appears during a send run (Pause/Stop). Content scrolls between them. Everything is left-aligned; numbers right-align in their cells.

---

## ICONOGRAPHY

- **System: [Lucide](https://lucide.dev) line icons**, the natural fit for a React + Tailwind utility extension. 1.75px stroke, 16–18px in this UI, `currentColor` so they inherit text color. Loaded via CDN (`lucide` UMD) in the cards and UI kit; in production install the `lucide-react` package.
- **Why Lucide:** consistent geometric line style, huge coverage, MIT-licensed, no brand baggage. This is a *substitution* (no icon set was specified in the spec) — swap if you standardize on another set.
- **Workhorse icons:** `plus` (add prospect), `play` / `pause` / `square` (start/pause/stop), `rotate-ccw` (retry), `clipboard` / `clipboard-check` (copy context / paste message), `settings`, `trash-2`, `pencil`, `chevron-right`, `chevron-down`, `filter`, `search`, `external-link` (open profile), `check-circle-2` / `x-circle` / `circle-dashed` / `clock` (status glyphs), `loader` (sending), `triangle-alert` (failure), `info`.
- **Status glyphs** pair with the status colors: pending = `circle-dashed`, sending = `loader` (spinning), sent = `check-circle-2`, failed = `x-circle`, skipped = `corner-down-right` / `skip-forward`.
- **No emoji, no unicode-as-icon, no custom SVG illustration.** The brand mark is a typographic wordmark, not a drawn logo (see `assets/`).
- **Logo / app icon:** the extension uses simple letter-mark icons (16/48/128). This system ships a CSS/HTML wordmark lockup (`assets/wordmark.html`) rather than a raster logo, since none was provided. Provide real icon PNGs to replace.

---

## Index — what's in this folder

**Foundations**
- `styles.css` — the one entry point consumers link. `@import`s everything below.
- `tokens/colors.css` · `typography.css` · `spacing.css` · `radius-shadow.css` · `fonts.css` · `base.css`
- `foundations/*.html` — specimen cards (Type, Colors, Spacing) shown in the Design System tab.

**Components** (`components/`) — reusable React primitives, each with `.jsx` + `.d.ts` + `.prompt.md`, one `@dsCard` HTML per group:
- `core/` — `Button`, `IconButton`
- `forms/` — `Input`, `Textarea`, `Switch`
- `feedback/` — `StatusBadge`, `ProgressBar`, `Toast`, `Dialog`
- `data/` — `ProspectCard`

**Modules** (`screens/`) — the five side-panel screens as standalone **HTML/CSS** designs on the tokens: `queue.html`, `add-prospect.html`, `send-progress.html`, `run-summary.html`, `settings.html`, plus `index.html` (all five side by side) and `panel.css` (shared panel chrome linked by each module).

**Brand** (`assets/`) — `wordmark.html` lockup + iconography notes.

**Skill** — `SKILL.md` makes this folder usable as a downloadable Agent Skill.
