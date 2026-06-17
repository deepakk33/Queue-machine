---
name: linkedin-dm-queue-design
description: Use this skill to generate well-branded interfaces and assets for LinkedIn DM Queue (a personal-use Chrome side-panel extension for Sales Navigator outreach), either for production or throwaway prototypes/mocks. Contains the design tokens, colors, type, fonts, status system, components, and full HTML/CSS module designs for prototyping.
user-invocable: true
---

Read `readme.md` within this skill for the full design guide, then explore the other files.

**What's here**
- `styles.css` — the single CSS entry point. Link it and you inherit every token (colors, type, spacing, radius/shadow, fonts). It `@import`s everything in `tokens/`.
- `screens/` — the five side-panel **modules**, each as a standalone HTML/CSS file (`queue`, `add-prospect`, `send-progress`, `run-summary`, `settings`) plus `index.html` laying them out side by side. `panel.css` holds the shared panel chrome (header, rows, buttons, badges, fields). This is the fastest starting point for any new screen.
- `components/` — the same primitives as React components (`Button`, `Input`, `StatusBadge`, `ProspectCard`, …) for production work.
- `foundations/` — token specimen cards.

**How to work**
- For visual artifacts (mocks, throwaway prototypes, new screens): copy `styles.css` + `screens/panel.css`, then assemble markup with the existing classes (`.panel`, `.p-header`, `.pcard`, `.badge--sent`, `.btn--primary`, etc.). Keep the panel a fixed 360px column.
- For production code: read the tokens and component prop contracts (`*.d.ts` + `*.prompt.md`) and design with the real brand.
- Icons are Lucide (CDN `lucide` UMD, 1.75 stroke). No emoji.
- Copy is sentence case, direct, operational. Status words stay lowercase. Numbers/timers are monospace.

If invoked without guidance, ask what they want to build, ask a few questions, and act as an expert designer who outputs HTML artifacts or production code depending on the need.
