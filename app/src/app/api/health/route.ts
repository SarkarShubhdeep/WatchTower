import { NextResponse } from "next/server";
import { checkDb } from "@/lib/db";

export async function GET() {
  const result = checkDb();
  if (result.ok) return NextResponse.json({ ok: true });
  return NextResponse.json(
    { ok: false, error: result.error },
    { status: 503 }
  );
}
