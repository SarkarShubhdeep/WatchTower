# WatchTower — Local-first activity tracking

Privacy-focused, local-only time tracking in the spirit of [ActivityWatch](https://activitywatch.net/). All data stays on your machine. No cloud, no telemetry.

## What it is

WatchTower tracks what’s happening on your computer (active application, window title, optional browser tab, AFK, etc.) and stores everything in a local database. Data never leaves your device.

## Primary goal, 03/05/26 (current)

A simple application with a lightweight interface that:

- **Tracks** activity on the user’s computer (active app, window title, optional browser tab, AFK).
- **Shows a simple list** of activity with basic filtering.
- **Shows simple statistics** only — e.g. “Cursor 3h today”, “Slack 45m”, “Chrome – GitHub 20m”, “Google Meet 1.5h”, “AFK 4h”. No charts or graphs in the first version.

## Tech stack

- **Interface / client:** [Next.js](https://nextjs.org/)
- **Storage:** [SQLite](https://www.sqlite.org/) (single file, no server)
- **Runtime:** [Bun](https://bun.sh) (or Node.js LTS). No Docker required for the database.

## Local-first

All tracked data is stored in a local SQLite file on your machine. No server outside your machine. Zero-Docker, single-file backend.

## Future: NPM package

This repository is intended to evolve into an NPM package so other parts of your software can depend on it (e.g. API client and TypeScript types). The Next.js app will be the reference implementation or a companion UI.

## Design decisions

- **SQLite backend:** A single `.db` file (default: `watchtower.db` in the app directory). No Docker or external DB server. Optional `DB_PATH` in `.env` to change location.
- **Core as a local API:** The core is a service that (1) accepts tracking events (app, window, duration, etc.) and (2) exposes read endpoints for “today’s list” and “simple stats” (aggregations by app/duration). The NPM package will expose a client SDK and types; other products can `npm install` and talk to the same local API.
- **Tracking collectors:** ActivityWatch-style “watchers” (desktop process for active window, browser extension for tabs) are on the roadmap. A small desktop agent or browser extension will send events to the local API (separate repo or sub-package later).
- **Simple stats (v1):** Store raw events (app name, window title, start/end timestamps, optional category). The API aggregates by day and by app/window and returns simple summaries. The UI only renders lists and these summaries — no charts in v1.
- **Database:** SQLite only for now. DuckDB (or similar) may be added later for analytics; can attach the same SQLite file.

## Getting started

**Prerequisites:** [Bun](https://bun.sh) (or Node.js LTS). No Docker required.

1. **Optional:** Copy env example and set `DB_PATH` if you want a custom DB path.
   ```bash
   cp .env.example app/.env
   ```

2. **Run the app**
   ```bash
   cd app && bun install && bun run dev
   ```

3. **Open** [http://localhost:5800](http://localhost:5800). API health: [http://localhost:5800/api/health](http://localhost:5800/api/health) → `{"ok":true}` when SQLite is available.

The database file (`watchtower.db`) is created automatically in the app directory on first run—no setup needed. Same for anyone who clones or forks the repo.

If the health check reports a "bindings" error, run `npm rebuild better-sqlite3` in the `app` directory.

## License

See [LICENSE](LICENSE) (MIT).
