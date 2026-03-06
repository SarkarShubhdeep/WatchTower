#!/usr/bin/env bun
/**
 * AFK watcher for WatchTower (macOS).
 * Polls system idle time; when idle >= threshold, marks AFK and sends events to the local API.
 * Run while the WatchTower app (localhost:5800) is running.
 *
 * Usage: bun run watcher/afk.ts
 * Optional: WATCHTOWER_API_URL=http://localhost:5800 (default)
 *           WATCHTOWER_POLL_MS=30000 (default 30s)
 *           WATCHTOWER_AFK_SEC=180 (default 3 min idle = AFK)
 */

const API_URL = process.env.WATCHTOWER_API_URL ?? "http://localhost:5800";
const POLL_MS = Math.max(5000, parseInt(process.env.WATCHTOWER_POLL_MS ?? "30000", 10));
const AFK_THRESHOLD_SEC = Math.max(60, parseInt(process.env.WATCHTOWER_AFK_SEC ?? "180", 10));

async function getIdleSeconds(): Promise<number | null> {
  try {
    const proc = Bun.spawn(
      ["sh", "-c", "ioreg -l -c IOHIDSystem 2>/dev/null | awk '/HIDIdleTime/ {print int($NF/1000000000); exit}'"],
      { stdout: "pipe", stderr: "pipe" }
    );
    const out = await new Response(proc.stdout).text();
    await proc.exited;
    if (proc.exitCode !== 0) return null;
    const n = parseInt(out.trim(), 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

async function sendEvent(
  status: "afk" | "not-afk",
  startTs: number,
  endTs: number
): Promise<void> {
  const duration = endTs - startTs;
  if (duration <= 0) return;
  const payload = {
    source: "afk",
    timestamp: startTs,
    duration,
    data: {
      app: status === "afk" ? "AFK" : "Active",
      category: status === "afk" ? "afk" : undefined,
      status,
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
  console.log(
    "WatchTower AFK watcher (macOS). API:",
    API_URL,
    "Poll (ms):",
    POLL_MS,
    "AFK threshold (s):",
    AFK_THRESHOLD_SEC
  );
  let lastStatus: "afk" | "not-afk" | null = null;
  let lastTs = Math.floor(Date.now() / 1000);

  for (;;) {
    await new Promise((r) => setTimeout(r, POLL_MS));
    const idleSec = await getIdleSeconds();
    if (idleSec == null) continue;
    const now = Math.floor(Date.now() / 1000);
    const isAfk = idleSec >= AFK_THRESHOLD_SEC;
    const status: "afk" | "not-afk" = isAfk ? "afk" : "not-afk";
    if (lastStatus === status) continue;
    if (lastStatus != null) {
      await sendEvent(lastStatus, lastTs, now);
    }
    lastStatus = status;
    lastTs = now;
  }
}

main();
