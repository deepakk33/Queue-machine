# LinkedIn DM Queue

Personal-use Chrome extension (Manifest V3) that acts as an outbound command center for LinkedIn Sales Navigator: build a prospect queue, compose/paste messages (manual AI-assisted clipboard flow), and send them one by one through the Sales Nav UI with human-like delays.

Single-user. No multi-user, cloud sync, auth, or Web Store distribution.

## Stack

React 18 · Zustand 4 · Tailwind 3 · Dexie.js 4 (IndexedDB) · Vite 5 + CRXJS 2 · TypeScript 5.

## Develop

```bash
pnpm install
pnpm dev         # Vite dev server with HMR
pnpm build       # production bundle → dist/
pnpm typecheck
```

## Load in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `dist/` folder (run `pnpm build` first; in dev, CRXJS also serves a loadable build).
4. The extension icon appears in the toolbar — click it to open the side panel.

Content-script changes may need a page refresh on LinkedIn; service-worker changes may need **Update** on the extensions page.

## Docs

- [Requirements (PRD, AC-1..39)](linkedin-dm-queue-requirements.md)
- [Technical design](linkedin-dm-queue-technical-design.md)
- [Feature docs](docs/features/README.md)
