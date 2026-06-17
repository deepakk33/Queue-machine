# CLAUDE.md — LinkedIn DM Queue

## Project

A Chrome extension (Manifest V3) that acts as a personal outbound command center for LinkedIn Sales Navigator: build a prospect queue, compose/paste messages (manual AI-assisted clipboard flow), and send them one by one through the Sales Nav UI with human-like delays. **Personal-use, single-user.** No multi-user, cloud sync, auth, or Web Store distribution.

**Status:** greenfield — docs + config seeded, no app code yet.

## Stack (IMPORTANT)

| Layer | Tech |
|---|---|
| Extension | Chrome Manifest V3 (side panel, content scripts, service worker) |
| UI | React 18 (functional components + hooks) |
| State | Zustand 4 |
| Styling | Tailwind CSS 3 |
| Local DB | Dexie.js 4 (IndexedDB) — not `chrome.storage` (no 10MB cap, structured queries) |
| Build | Vite 5 + CRXJS 2 (HMR) |
| Language | TypeScript 5 |
| IDs | `crypto.randomUUID()` (native, no dep) |

Pinned in [technical-design §2](linkedin-dm-queue-technical-design.md). Don't swap these without reason.

## Repo map

```
src/
├── background/   # service worker: index.ts, send-engine.ts, tab-manager.ts, message-handler.ts
├── content/      # content script: index.ts, dom-actions.ts, dom-selectors.ts, dom-utils.ts
├── sidepanel/    # React UI: main.tsx, App.tsx, views/, components/, hooks/
├── store/        # Zustand: queue-store.ts, settings-store.ts, send-state-store.ts
├── db/           # Dexie: index.ts, prospects.ts, settings.ts
├── shared/       # types.ts, constants.ts, messages.ts
└── utils/        # clipboard.ts, delay.ts, template.ts
manifest.json · vite.config.ts · tsconfig.json · tailwind.config.js · package.json
```

Full tree + file responsibilities: [technical-design §3](linkedin-dm-queue-technical-design.md).

## Spec is source of truth

Two root docs are authoritative — **read before coding**:
- [linkedin-dm-queue-requirements.md](linkedin-dm-queue-requirements.md) — PRD, data model, UI spec, acceptance criteria (AC-1..AC-39), out-of-scope, risks.
- [linkedin-dm-queue-technical-design.md](linkedin-dm-queue-technical-design.md) — TS interfaces, message types, Dexie schema + CRUD, send-engine impl, content-script DOM layer, manifest/build config.

When the docs conflict, requirements wins on *what*, technical-design wins on *how*.

## Architecture

Three extension contexts coordinated by message passing — Side Panel (React UI) ↔ Background Service Worker (send engine / state machine) ↔ Content Script (DOM actions on linkedin.com); Dexie/IndexedDB data tier. See [docs/features/architecture/01-system-overview.md](docs/features/architecture/01-system-overview.md). Sales Navigator is the primary surface; centralize selectors in `content/dom-selectors.ts`.

## Design system (IMPORTANT)

[docs/design-prototype/](docs/design-prototype/) is the **visual source of truth — it replaces Figma** (design "Queue": warm cream/stone neutrals + dusty purple accent, Fraunces/IBM Plex fonts, five status hues). Tokens in `tokens/`, single entry `styles.css`; React primitives in `components/`; full HTML/CSS screen mockups in `screens/`; also an Agent Skill (`SKILL.md`). Overview + token table + screen↔feature map: [docs/features/architecture/02-design-system.md](docs/features/architecture/02-design-system.md). The built `src/sidepanel/` UI now follows "Queue": tokens are ported into `tailwind.config.js`, fonts are self-hosted via `@fontsource`, icons via `lucide-react`. When building/restyling UI, follow the prototype.

## Feature docs convention

Every feature is documented in [docs/features/](docs/features/) using the adapted **6-section template — NEVER deviate from the order**:

1. Overview · 2. Sub-features · 3. Data model · 4. Messaging / flow · 5. UI components · 6. Edge cases / empty states / error states

No RBAC matrix (single-user, no roles). §5 (UI components) **links the matching screen + components in the design system** ([docs/design-prototype/](docs/design-prototype/)). When you add or change a feature, create/update its `FX-*.md` doc and add it to [docs/features/README.md](docs/features/README.md). Keep docs in sync with code.

## Memory management

Claude local memory for this repo lives at:
`/Users/deepak/.claude/projects/-Users-deepak-sm-project-Queue-machine/memory/`

Indexed by `MEMORY.md` (one line per memory file). Frontmatter format:
```yaml
---
name: <type>-<kebab-slug>
description: <1-2 sentence summary>
metadata:
  node_type: memory
  type: project | reference | feedback
---
```

- Add a `project-*` memory when a feature ships or a non-obvious decision is made.
- Add/update a `feedback-*` memory for new conventions.
- Add `reference-*` for durable pointers (specs, docs, resources).
- Don't duplicate what code/docs already record. Update existing files over creating duplicates.

## GIT convention

**DO NOT** put "Generated with Claude Code", "Co-Authored-By: Claude", or any "claude" mention in commit messages or PR titles/bodies. Write git history as if authored by the user — omit the Claude trailer entirely.

Commit or push only when asked.

## Scope guardrails (v1)

**In scope:** manual queue, clipboard AI compose flow, sequential sender with delays, pause/resume, retry, run summary, settings. Sales Navigator first.

**Deferred (do NOT build in v1 — requirements §12):** CSV import/export, automated AI generation (auto-paste into Claude), scheduling, email/other channels, multi-user/cloud/auth, Web Store distribution, connection requests, analytics beyond the run summary.
