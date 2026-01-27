
import { Router } from 'express';
import { pool } from './db.js';
import { requireAuth } from './middleware/authMiddleware.js';
import { requireRole } from './middleware/roleMiddleware.js';

const router = Router();

router.get('/', async (req, res) => {
  const r = await pool.query("SELECT *, (now() >= (start_time - INTERVAL '30 minutes')) AS locked FROM matches ORDER BY start_time ASC");
  res.json(r.rows);
});

router.patch('/:id/result', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { final_home_goals, final_away_goals } = req.body;
  await pool.query('UPDATE matches SET final_home_goals=$1, final_away_goals=$2 WHERE id=$3', [final_home_goals, final_away_goals, id]);

  // Recalculate scores for this match
  const q = `
    SELECT p.user_id, p.match_id, p.home_goals AS ph, p.away_goals AS pa,
           m.final_home_goals AS fh, m.final_away_goals AS fa
    FROM predictions p
    JOIN matches m ON m.id = p.match_id
    WHERE p.match_id = $1 AND m.final_home_goals IS NOT NULL AND m.final_away_goals IS NOT NULL
  `;
  const { rows } = await pool.query(q, [id]);
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
  }
  res.json({ ok: true, updatedScores: rows.length });
});

export default router;
