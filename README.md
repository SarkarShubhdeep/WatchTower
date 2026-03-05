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
- **Storage:** [MongoDB](https://www.mongodb.com/) (run locally)
- **Environment:** [Docker](https://www.docker.com/) (and Docker Compose) so the same setup runs on any platform

## Local-first

All tracked data is stored only in a local MongoDB instance (e.g. in Docker with a named volume). No server outside the user’s machine. The design is “local DB”; the first implementation uses MongoDB.

## Future: NPM package

This repository is intended to evolve into an NPM package so other parts of your software can depend on it (e.g. API client and TypeScript types). The Next.js app will be the reference implementation or a companion UI.

## Design decisions

- **Docker Compose:** MongoDB (and optionally the full stack) runs via Compose. Data lives in a named volume so it persists and stays on the host. Environment-safe and local-only.
- **Core as a local API:** The core is a service that (1) accepts tracking events (app, window, duration, etc.) and (2) exposes read endpoints for “today’s list” and “simple stats” (aggregations by app/duration). The NPM package will expose a client SDK and types; other products can `npm install` and talk to the same local API.
- **Tracking collectors:** ActivityWatch-style “watchers” (desktop process for active window, browser extension for tabs) are on the roadmap. A small desktop agent or browser extension will send events to the local API (separate repo or sub-package later).
- **Simple stats (v1):** Store raw events (app name, window title, start/end timestamps, optional category). The API aggregates by day and by app/window and returns simple summaries. The UI only renders lists and these summaries — no charts in v1.
- **Database:** First implementation is MongoDB. The design could later support alternatives (e.g. SQLite for a zero-Docker, single-file option) while staying local-only.

## Getting started

**Prerequisites:** [Bun](https://bun.sh) (optional) or Node.js LTS, [Docker](https://www.docker.com/).

1. **Clone the repository**
   ```bash
   git clone https://github.com/SarkarShubhdeep/WatchTower.git && cd WatchTower
   ```

2. **Start MongoDB** (data is stored in a named volume on your machine)
   ```bash
   docker compose up -d
   ```

3. **Run the app**
   ```bash
   cd app && bun run dev
   ```
   Or from the repo root: `bun run dev`. If you use npm: `cd app && npm run dev`.
   Open [http://localhost:3000](http://localhost:3000).

4. **Optional:** Copy `.env.example` to `app/.env` and set `MONGODB_URI` if you need to override the default. The API route `/api/health` pings MongoDB when the app is running.

**Stop MongoDB:** `docker compose down` (data persists in the volume).

## License

See [LICENSE](LICENSE) (MIT).
