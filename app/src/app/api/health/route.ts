import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return NextResponse.json(
      { ok: false, error: "MONGODB_URI not set" },
      { status: 503 }
    );
  }
  try {
    const client = new MongoClient(uri);
    await client.connect();
    await client.db().admin().ping();
    await client.close();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 503 }
    );
  }
}
