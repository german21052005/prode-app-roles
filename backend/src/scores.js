
import { Router } from 'express';
import { pool } from './db.js';

const router = Router();

router.post('/recalc', async (_, res) => {
  const q = `
    SELECT p.user_id, p.match_id, p.home_goals AS ph, p.away_goals AS pa,
           m.final_home_goals AS fh, m.final_away_goals AS fa
    FROM predictions p
    JOIN matches m ON m.id = p.match_id
    WHERE m.final_home_goals IS NOT NULL AND m.final_away_goals IS NOT NULL
  `;
  const { rows } = await pool.query(q);
  let upserts = 0;
  function sign(h,a){ if(h>a) return 'L'; if(h<a) return 'V'; return 'E'; }
  for(const r of rows){
    let pts = 0; let reason = [];
    if (sign(r.ph, r.pa) === sign(r.fh, r.fa)) { pts += 3; reason.push('signo'); }
    if (r.ph === r.fh && r.pa === r.fa) { pts += 3; reason.push('exacto'); }
    await pool.query(`
      INSERT INTO scores(user_id, match_id, points, reason)
      VALUES($1,$2,$3,$4)
      ON CONFLICT (user_id, match_id)
      DO UPDATE SET points=$3, reason=$4
    `, [r.user_id, r.match_id, pts, reason.join('+') || null]);
    upserts++;
  }
  res.json({ ok: true, updated: upserts });
});

router.get('/', async (_, res) => {
  const q = `
    SELECT u.username, COALESCE(SUM(s.points),0) AS total
    FROM users u
    LEFT JOIN scores s ON s.user_id = u.id
    GROUP BY u.username
    ORDER BY total DESC, u.username ASC
  `;
  const r = await pool.query(q);
  res.json(r.rows);
});

export default router;
