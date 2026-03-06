# WatchTower watchers

Separate processes that collect activity (window, AFK) and send events to the WatchTower API at `http://localhost:5800`. Run them while the Next.js app is running.

## Window watcher (macOS)

Tracks the frontmost application and window title.

```bash
bun run watcher:window
# or: bun run watcher/window.ts
```

- **WATCHTOWER_API_URL** — default `http://localhost:5800`
- **WATCHTOWER_POLL_MS** — poll interval in ms (default `5000`)

## AFK watcher (macOS)

Tracks keyboard/mouse idle time and sends AFK / not-AFK segments.

```bash
bun run watcher:afk
# or: bun run watcher/afk.ts
```

- **WATCHTOWER_API_URL** — default `http://localhost:5800`
- **WATCHTOWER_POLL_MS** — poll interval in ms (default `30000`)
- **WATCHTOWER_AFK_SEC** — idle seconds before marking AFK (default `180`)

## Requirements

- **macOS** — window watcher uses AppleScript; AFK watcher uses `ioreg` (IOHIDSystem).
- **Bun** — run with `bun run` from the repo root.
