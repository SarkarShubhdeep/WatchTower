import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  let year: number;
  let month: number;
  let day: number;

  if (dateParam) {
    const parts = dateParam.split("-");
    if (parts.length !== 3) {
      return NextResponse.json(
        { error: "Invalid date parameter" },
        { status: 400 }
      );
    }
    year = Number.parseInt(parts[0] ?? "", 10);
    month = Number.parseInt(parts[1] ?? "", 10);
    day = Number.parseInt(parts[2] ?? "", 10);
  } else {
    const now = new Date();
    year = now.getUTCFullYear();
    month = now.getUTCMonth() + 1;
    day = now.getUTCDate();
  }

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return NextResponse.json(
      { error: "Invalid date parameter" },
      { status: 400 }
    );
  }

  const startOfDay = Math.floor(Date.UTC(year, month - 1, day) / 1000);
  const endOfDay = Math.floor(Date.UTC(year, month - 1, day + 1) / 1000);

  const database = getDb();
  const rows = database
    .prepare(
      `
    SELECT app, window_title, SUM(end_ts - start_ts) AS duration_seconds
    FROM events
    WHERE start_ts >= ? AND start_ts < ?
    GROUP BY app, window_title
    ORDER BY duration_seconds DESC
  `
    )
    .all(startOfDay, endOfDay) as {
    app: string;
    window_title: string | null;
    duration_seconds: number;
  }[];

  const stats = rows.map((row) => ({
    app: row.app,
    window_title: row.window_title,
    duration_seconds: row.duration_seconds,
  }));

  return NextResponse.json({ stats });
}
