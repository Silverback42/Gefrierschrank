import Database from "better-sqlite3";
import path from "path";

const dbPath =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "gefrierschrank.db");

function createDb() {
  if (process.env.NEXT_BUILD === "1") {
    return new Database(":memory:");
  }

  const fs = require("fs");
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);

  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      quantity INTEGER NOT NULL DEFAULT 0,
      icon TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      action TEXT NOT NULL CHECK(action IN ('add','remove','set','create','delete')),
      quantity_change INTEGER NOT NULL,
      quantity_after INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_activity_product
      ON activity_log(product_id, created_at DESC);
  `);

  return db;
}

const db = createDb();

export default db;
