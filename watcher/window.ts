#!/usr/bin/env bun
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

/**
 * Window watcher for WatchTower (macOS).
 * Polls the frontmost app and window title, sends events to the local API when they change.
 * Run while the WatchTower app (localhost:5800) is running.
 *
 * Usage: bun run watcher/window.ts
 * Optional: WATCHTOWER_API_URL=http://localhost:5800 (default)
 *           WATCHTOWER_POLL_MS=5000 (default)
 */

const API_URL = process.env.WATCHTOWER_API_URL ?? "http://localhost:5800";
const POLL_MS = Math.max(1000, parseInt(process.env.WATCHTOWER_POLL_MS ?? "5000", 10));
const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = join(__dirname, "get-window.applescript");

interface WindowInfo {
  app: string;
  title: string;
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

async function sendEvent(previous: WindowInfo, startTs: number, endTs: number): Promise<void> {
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

async function main(): Promise<void> {
  console.log("WatchTower window watcher (macOS). API:", API_URL, "Poll (ms):", POLL_MS);
  let last: WindowInfo | null = null;
  let lastTs = Math.floor(Date.now() / 1000);

  for (;;) {
    await new Promise((r) => setTimeout(r, POLL_MS));
    const current = await getFrontWindow();
    if (!current) continue;
    const now = Math.floor(Date.now() / 1000);
    const same =
      last &&
      last.app === current.app &&
      (last.title === current.title || (!last.title && !current.title));
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

main();
