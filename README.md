# LinkedIn DM Queue

Personal-use Chrome extension (Manifest V3) that acts as an outbound command center for LinkedIn Sales Navigator: build a prospect queue, compose/paste messages (manual AI-assisted clipboard flow), and send them one by one through the Sales Nav UI with human-like delays.

Single-user. No multi-user, cloud sync, auth, or Web Store distribution.

## Stack

React 18 · Zustand 4 · Tailwind 3 · Dexie.js 4 (IndexedDB) · Vite 5 + CRXJS 2 · TypeScript 5.

## Install (prebuilt — any machine, no build tools)

Use this to run the extension on another computer without Node/pnpm.

1. Go to the [latest Release](https://github.com/deepakk33/Queue-machine/releases/latest) and download **`queue-machine-extension.zip`**.
2. Unzip it (you should see `manifest.json` at the top of the folder).
3. Open `chrome://extensions/` and enable **Developer mode** (top-right).
4. Click **Load unpacked** and select the unzipped folder.
5. Click the extension icon in the toolbar to open the side panel.

To update later: download the newer release zip, then on `chrome://extensions/` either remove + re-load unpacked, or click **Update**.

## Usage

1. Add a prospect with a **Sales Navigator lead URL** (`https://www.linkedin.com/sales/lead/…`) — that's the verified send surface.
2. Compose the message (or use **Copy context** → paste into your AI tool → **Paste message** back).
3. **Start sending** — the extension opens each lead, finds Message, fills the composer, clicks Send, then waits the configured interval (default 20–45s, adjustable in **Settings**).

Each successful send delivers a **real InMail** — test carefully. Sends use the active Chrome tab, so keep Chrome focused on the Sales Navigator window during a run (see [known limitations](docs/features/F3-sending-engine.md)).

## Build from source

```bash
pnpm install
pnpm dev         # Vite dev server with HMR
pnpm build       # production bundle → dist/
pnpm typecheck
```

Then load it unpacked:

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `dist/` folder (run `pnpm build` first; in dev, CRXJS also serves a loadable build).
4. The extension icon appears in the toolbar — click it to open the side panel.

Content-script changes may need a page refresh on LinkedIn; service-worker changes may need **Update** on the extensions page.

## Docs

- [Requirements (PRD, AC-1..39)](linkedin-dm-queue-requirements.md)
- [Technical design](linkedin-dm-queue-technical-design.md)
- [Feature docs](docs/features/README.md)
