#!/usr/bin/env bun
import { fileURLToPath } from "node:url";
import path, { join, dirname } from "node:path";
import { Database } from "bun:sqlite";

/**
 * Window watcher for WatchTower (macOS).
 * Polls the frontmost app and window title, sends events to the local API when they change.
 * Optionally shows a live terminal feed of recent events.
 *
 * Usage: bun run watcher/window.ts
 * Optional: WATCHTOWER_API_URL=http://localhost:5800 (default)
 *           WATCHTOWER_POLL_MS=5000 (default)
 *           WATCHTOWER_FEED_MS=1000 (default, feed refresh interval)
 *           DB_PATH=/absolute/path/to/watchtower.db (optional, otherwise app/watchtower.db)
 */

const API_URL =
  process.env.WATCHTOWER_API_URL ?? "http://localhost:5800";
const POLL_MS = Math.max(
  1000,
  parseInt(process.env.WATCHTOWER_POLL_MS ?? "5000", 10)
);
const FEED_REFRESH_MS = Math.max(
  500,
  parseInt(process.env.WATCHTOWER_FEED_MS ?? "1000", 10)
);
const FEED_LIMIT = 20;

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = join(__dirname, "get-window.applescript");
const DB_PATH =
  process.env.DB_PATH ??
  path.join(process.cwd(), "app", "watchtower.db");

interface WindowInfo {
  app: string;
  title: string;
}

type EventRow = {
  id: number;
  app: string;
  window_title: string | null;
  start_ts: number;
  end_ts: number;
};

let running = true;
let feedEnabled = false;

let db: Database | null = null;

function getDb(): Database {
  if (!db) {
    db = new Database(DB_PATH, { readonly: true });
  }
  return db;
}

function getRecentEvents(limit: number): EventRow[] {
  const database = getDb();
  const stmt = database.prepare(
    `
      SELECT id, app, window_title, start_ts, end_ts
      FROM events
      ORDER BY id DESC
      LIMIT ?
    `
  );
  return stmt.all(limit) as EventRow[];
}

function formatDuration(startTs: number, endTs: number): string {
  const seconds = Math.max(0, endTs - startTs);
  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${rem}s`;
}

function renderFeed(events: EventRow[]): void {
  console.clear();
  console.log(
    "WatchTower live window feed (press t to toggle, q to quit)."
  );
  console.log(" id    app           title                         duration");
  console.log(
    "----------------------------------------------------------------"
  );
  if (events.length === 0) {
    console.log("(no events yet)");
    return;
  }
  const ordered = [...events].reverse();
  for (const ev of ordered) {
    const duration = formatDuration(ev.start_ts, ev.end_ts);
    const app = ev.app || "unknown";
    const title = ev.window_title ?? "";
    const idStr = String(ev.id).padStart(4, " ");
    const appStr = app.padEnd(12, " ").slice(0, 12);
    const titleStr = title.padEnd(30, " ").slice(0, 30);
    console.log(`${idStr}  ${appStr}  ${titleStr}  ${duration}`);
  }
}

function setupKeyHandling(): void {
  const stdin = process.stdin;
  if (!stdin || !stdin.isTTY) {
    console.log("Press Ctrl+C to quit.");
    return;
  }
  stdin.setRawMode?.(true);
  stdin.setEncoding("utf8");
  stdin.resume();
  stdin.on("data", (data: string) => {
    const key = data;
    if (key === "q") {
      running = false;
      feedEnabled = false;
      stdin.setRawMode?.(false);
      stdin.pause();
    } else if (key === "t") {
      feedEnabled = !feedEnabled;
      if (!feedEnabled) {
        console.log(
          "Live feed paused. Press t to resume, q to quit."
        );
      }
    } else if (key === "\u0003") {
      // Ctrl+C
      running = false;
      feedEnabled = false;
      stdin.setRawMode?.(false);
      stdin.pause();
    }
  });
}

async function getFrontWindow(): Promise<WindowInfo | null> {
  try {
    const proc = Bun.spawn(["osascript", SCRIPT_PATH], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const out = await new Response(proc.stdout).text();
    const err = await new Response(proc.stderr).text();
    await proc.exited;
    if (proc.exitCode !== 0) {
      console.error("osascript stderr:", err || "non-zero exit");
      return null;
    }
    const line = out.trim();
    const sep = "|||";
    const i = line.indexOf(sep);
    if (i === -1) return null;
    const app = line.slice(0, i).trim() || "unknown";
    const title = line.slice(i + sep.length).trim();
    return { app, title };
  } catch (e) {
    console.error("getFrontWindow error:", e);
    return null;
  }
}

async function sendEvent(
  previous: WindowInfo,
  startTs: number,
  endTs: number
): Promise<void> {
  const duration = endTs - startTs;
  if (duration <= 0) return;
  const payload = {
    source: "window",
    timestamp: startTs,
    duration,
    data: {
      app: previous.app,
      title: previous.title || undefined,
    },
  };
  try {
    const res = await fetch(`${API_URL}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("API error", res.status, text);
    }
  } catch (e) {
    console.error("sendEvent error:", e);
  }
}

async function runWatcher(): Promise<void> {
  let last: WindowInfo | null = null;
  let lastTs = Math.floor(Date.now() / 1000);

  while (running) {
    await new Promise((r) => setTimeout(r, POLL_MS));
    if (!running) break;
    const current = await getFrontWindow();
    if (!current) continue;
    const now = Math.floor(Date.now() / 1000);
    const same =
      last &&
      last.app === current.app &&
      (last.title === current.title ||
        (!last.title && !current.title));
    if (same) {
      continue;
    }
    if (last) {
      await sendEvent(last, lastTs, now);
    }
    last = current;
    lastTs = now;
  }
}

async function runFeed(): Promise<void> {
  console.log(
    "Press t to toggle live feed, q to quit (watcher continues in background until you quit)."
  );
  while (running) {
    if (feedEnabled) {
      try {
        const events = getRecentEvents(FEED_LIMIT);
        renderFeed(events);
      } catch (e) {
        console.error("feed error:", e);
      }
    }
    await new Promise((r) => setTimeout(r, FEED_REFRESH_MS));
  }
}

async function main(): Promise<void> {
  console.log(
    "WatchTower window watcher (macOS). API:",
    API_URL,
    "Poll (ms):",
    POLL_MS
  );
  setupKeyHandling();
  await Promise.all([runWatcher(), runFeed()]);
}

main().catch((e) => {
  console.error("Watcher crashed:", e);
  process.exitCode = 1;
});
