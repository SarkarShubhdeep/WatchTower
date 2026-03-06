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
        source TEXT DEFAULT 'window',
        app TEXT NOT NULL,
        window_title TEXT,
        start_ts INTEGER NOT NULL,
        end_ts INTEGER NOT NULL,
        category TEXT,
        data TEXT
      )
    `);
    migrateAddColumns(db);
  }
  return db;
}

function migrateAddColumns(database: Database.Database): void {
  const columns = database
    .prepare("PRAGMA table_info(events)")
    .all() as { name: string }[];
  const names = new Set(columns.map((c) => c.name));
  if (!names.has("source")) {
    database.exec("ALTER TABLE events ADD COLUMN source TEXT DEFAULT 'window'");
  }
  if (!names.has("data")) {
    database.exec("ALTER TABLE events ADD COLUMN data TEXT");
  }
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
