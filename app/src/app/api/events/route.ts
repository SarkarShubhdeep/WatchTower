import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const DEFAULT_SOURCE = "window";
const PULSETIME_SEC = Math.max(
  0,
  parseInt(process.env.WATCHTOWER_PULSETIME_SEC ?? "60", 10)
);

function parseTimestamp(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.floor(value);
  }
  if (typeof value === "string") {
    const ms = Date.parse(value);
    if (Number.isFinite(ms)) return Math.floor(ms / 1000);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const source =
      typeof body.source === "string" && body.source.trim()
        ? body.source.trim()
        : DEFAULT_SOURCE;
    const timestamp = parseTimestamp(body.timestamp);
    const duration =
      typeof body.duration === "number" && Number.isFinite(body.duration)
        ? Math.max(0, Math.floor(body.duration))
        : null;
    const data = body.data != null ? body.data : {};

    if (timestamp == null || duration == null) {
      return NextResponse.json(
        { error: "Missing or invalid timestamp or duration" },
        { status: 400 }
      );
    }

    const app =
      typeof data.app === "string" && data.app.trim()
        ? data.app.trim()
        : "unknown";
    const window_title =
      typeof data.title === "string" ? data.title.trim() || null : null;
    const category =
      typeof data.category === "string" ? data.category.trim() || null : null;
    const dataJson = JSON.stringify(data);

    const start_ts = timestamp;
    const end_ts = timestamp + duration;

    const database = getDb();

    if (PULSETIME_SEC > 0) {
      const last = database
        .prepare(
          `
        SELECT id, end_ts FROM events
        WHERE source = ? AND app = ? AND (window_title IS ? OR (window_title IS NOT NULL AND window_title = ?))
          AND (category IS ? OR (category IS NOT NULL AND category = ?))
        ORDER BY id DESC LIMIT 1
      `
        )
        .get(
          source,
          app,
          window_title,
          window_title,
          category,
          category
        ) as { id: number; end_ts: number } | undefined;
      if (
        last &&
        start_ts <= last.end_ts + PULSETIME_SEC
      ) {
        database
          .prepare("UPDATE events SET end_ts = ?, data = ? WHERE id = ?")
          .run(end_ts, dataJson, last.id);
        return NextResponse.json({ ok: true, merged: true });
      }
    }

    const stmt = database.prepare(`
      INSERT INTO events (source, app, window_title, start_ts, end_ts, category, data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(source, app, window_title, start_ts, end_ts, category, dataJson);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid request" },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  const date = dateParam
    ? new Date(dateParam)
    : new Date();
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json(
      { error: "Invalid date parameter" },
      { status: 400 }
    );
  }

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const startOfDay = Math.floor(
    new Date(year, month, day).getTime() / 1000
  );
  const endOfDay = Math.floor(
    new Date(year, month, day + 1).getTime() / 1000
  );

  const database = getDb();
  const rows = database
    .prepare(
      `
    SELECT id, source, app, window_title, start_ts, end_ts, category, data
    FROM events
    WHERE start_ts >= ? AND start_ts < ?
    ORDER BY start_ts ASC
  `
    )
    .all(startOfDay, endOfDay) as {
    id: number;
    source: string;
    app: string;
    window_title: string | null;
    start_ts: number;
    end_ts: number;
    category: string | null;
    data: string | null;
  }[];

  const events = rows.map((row) => ({
    id: row.id,
    source: row.source,
    app: row.app,
    window_title: row.window_title,
    start_ts: row.start_ts,
    end_ts: row.end_ts,
    duration: row.end_ts - row.start_ts,
    category: row.category,
    data: row.data ? (JSON.parse(row.data) as unknown) : undefined,
  }));

  return NextResponse.json({ events });
}
