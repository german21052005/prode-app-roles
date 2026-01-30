
import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from './middleware/authMiddleware.js';

const router = Router();

router.get('/mine', requireAuth, async (req, res) => {
  const r = await pool.query('SELECT * FROM predictions WHERE user_id=$1', [req.user.id]);
  res.json(r.rows);
});

router.post('/', requireAuth, async (req, res) => {
  // Bloquear carga de pronósticos por parte del usuario admin
  if(req.user?.role === 'admin') {
    return res.status(403).json({error: 'El user "admin" no pueden participar.'});
  }
  const { match_id, home_goals, away_goals } = req.body;
  const m = await pool.query('SELECT start_time FROM matches WHERE id=$1', [match_id]);
  if (m.rowCount === 0) return res.status(404).json({ error: 'Partido no encontrado' });
  const match = m.rows[0];
  const now = new Date();
  const limit = new Date(match.start_time);
  limit.setMinutes(limit.getMinutes() - 30);
  if (now >= limit) return res.status(403).json({ error: 'Pronóstico cerrado' });

  await pool.query(`
    INSERT INTO predictions (user_id, match_id, home_goals, away_goals, updated_at)
    VALUES ($1,$2,$3,$4, now())
    ON CONFLICT (user_id, match_id)
    DO UPDATE SET home_goals=$3, away_goals=$4, updated_at=now()
  `, [req.user.id, match_id, home_goals, away_goals]);

  res.json({ ok: true });
});

export default router;
