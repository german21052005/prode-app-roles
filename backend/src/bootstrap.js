
import { pool } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function bootstrap(){
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'player',
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      round INTEGER,
      home VARCHAR(100) NOT NULL,
      away VARCHAR(100) NOT NULL,
      start_time TIMESTAMPTZ NOT NULL,
      final_home_goals INTEGER,
      final_away_goals INTEGER
    );

    CREATE TABLE IF NOT EXISTS predictions (
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
      home_goals INTEGER NOT NULL,
      away_goals INTEGER NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      PRIMARY KEY (user_id, match_id)
    );

    CREATE TABLE IF NOT EXISTS scores (
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
      points INTEGER NOT NULL,
      reason TEXT,
      PRIMARY KEY (user_id, match_id)
    );

    -- Auditoría básica de resultados
    CREATE TABLE IF NOT EXISTS match_audit (
      id SERIAL PRIMARY KEY,
      match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      by_user INTEGER REFERENCES users(id),
      action VARCHAR(30) NOT NULL,
      old_home INTEGER,
      old_away INTEGER,
      new_home INTEGER,
      new_away INTEGER,
      ip TEXT,
      at TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_match_audit_match ON match_audit(match_id);
    CREATE INDEX IF NOT EXISTS idx_match_audit_at ON match_audit(at DESC);
  `);

  // Seed initial admin user if env provided
  if (process.env.ADMIN_SEED_USER && process.env.ADMIN_SEED_PASS) {
    const u = process.env.ADMIN_SEED_USER;
    const p = process.env.ADMIN_SEED_PASS;
    try{
      const bcrypt = (await import('bcryptjs')).default;
      const hash = await bcrypt.hash(p, 10);
      await pool.query(`INSERT INTO users (username, password, role) VALUES ($1,$2,'admin') ON CONFLICT (username) DO NOTHING`, [u, hash]);
      console.log('Admin seed checked for user:', u);
    }catch(e){ console.warn('Admin seed error:', e.message); }
  }

  // Seed fixture if empty (keep your existing JSON path as in your project)
  const check = await pool.query('SELECT COUNT(*)::int AS c FROM matches');
  if (check.rows[0].c === 0) {
    const dataPath = path.join(__dirname, '..', 'data', 'fixture_apertura_2026.json');
    try{
      const json = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      for(const m of json.matches){
        await pool.query('INSERT INTO matches(round, home, away, start_time) VALUES ($1,$2,$3,$4)', [m.round, m.home, m.away, m.start_time]);
      }
      console.log(`Seeded ${json.matches.length} matches`);
    }catch(e){ console.warn('No fixture seed loaded:', e.message); }
  }
}
