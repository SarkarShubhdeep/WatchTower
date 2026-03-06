import path from "node:path";
import Database from "better-sqlite3";

const dbPath =
  process.env.DB_PATH ?? path.join(process.cwd(), "watchtower.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app TEXT NOT NULL,
        window_title TEXT,
        start_ts INTEGER NOT NULL,
        end_ts INTEGER NOT NULL,
        category TEXT
      )
    `);
  }
  return db;
}

export function checkDb(): { ok: true } | { ok: false; error: string } {
  try {
    const database = getDb();
    database.prepare("SELECT 1").get();
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export { getDb };
