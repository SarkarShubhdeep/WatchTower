import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  const date = dateParam ? new Date(dateParam) : new Date();
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
