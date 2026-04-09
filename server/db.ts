import { Database } from "bun:sqlite";
import { join, dirname } from "path";
import { mkdirSync } from "fs";

const dbPath = process.env.DB_PATH ?? join(import.meta.dir, "..", "myykfax.db");
mkdirSync(dirname(dbPath), { recursive: true });
export const db = new Database(dbPath);

db.exec("PRAGMA journal_mode=WAL;");
db.exec("PRAGMA foreign_keys=ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT NOT NULL UNIQUE COLLATE NOCASE,
    joined_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS facts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    submitted_by INTEGER REFERENCES guests(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    is_preseeded INTEGER NOT NULL DEFAULT 0,
    is_revealed INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS game_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    phase TEXT NOT NULL DEFAULT '0',
    current_fact_id INTEGER REFERENCES facts(id)
  );

  INSERT OR IGNORE INTO game_state (id, phase) VALUES (1, '0');

  CREATE TABLE IF NOT EXISTS guesses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guesser_id INTEGER NOT NULL REFERENCES guests(id),
    fact_id INTEGER NOT NULL REFERENCES facts(id),
    guessed_submitter_id INTEGER REFERENCES guests(id),
    submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
    is_correct INTEGER NOT NULL,
    UNIQUE(guesser_id, fact_id)
  );
`);

export type GameState = { id: 1; phase: "0" | "1" | "2"; current_fact_id: number | null };
export type Guest = { id: number; nickname: string; joined_at: string };
export type Fact = { id: number; text: string; submitted_by: number | null; created_at: string; is_preseeded: number; is_revealed: number };
export type Score = { nickname: string; score: number };

export const queries = {
  getGameState: db.query<GameState, []>("SELECT * FROM game_state WHERE id = 1"),

  getScores: db.query<Score, []>(`
    SELECT g.nickname, COUNT(CASE WHEN gu.is_correct = 1 THEN 1 END) as score
    FROM guests g
    LEFT JOIN guesses gu ON gu.guesser_id = g.id
    GROUP BY g.id, g.nickname
    ORDER BY score DESC, g.joined_at ASC
  `),

  getGuests: db.query<Guest, []>("SELECT * FROM guests ORDER BY joined_at ASC"),

  getRandomFact: db.query<Fact, []>("SELECT * FROM facts ORDER BY RANDOM() LIMIT 1"),

  getNextUnrevealedFact: db.query<Fact, []>(
    "SELECT * FROM facts WHERE is_revealed = 0 ORDER BY RANDOM() LIMIT 1"
  ),
};
