
import { Router } from 'express';
import { pool } from './db.js';
import { requireAuth } from './middleware/authMiddleware.js';
import { requireRole } from './middleware/roleMiddleware.js';

const router = Router();

// Listar partidos con indicador de bloqueo
router.get('/', async (_req, res) => {
  const r = await pool.query("SELECT *, (now() >= (start_time - INTERVAL '30 minutes')) AS locked FROM matches ORDER BY start_time ASC");
  res.json(r.rows);
});

// Cargar resultado (solo admin) con: auditoría + bloqueo de re-edición + recálculo
router.patch('/:id/result', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { final_home_goals, final_away_goals } = req.body;

  // 1) Leer estado actual
  const cur = await pool.query('SELECT final_home_goals, final_away_goals FROM matches WHERE id=$1', [id]);
  if (cur.rowCount === 0) return res.status(404).json({ error: 'Partido no encontrado' });
  const prev = cur.rows[0];

  // 2) Bloqueo de re-edición: si ya hay resultado, no permitir sobrescribir
  if (prev.final_home_goals !== null || prev.final_away_goals !== null) {
    // Registrar intento bloqueado
    await pool.query(
      `INSERT INTO match_audit(match_id, by_user, action, old_home, old_away, new_home, new_away, ip)
       VALUES($1,$2,'blocked_overwrite',$3,$4,$5,$6,$7)`,
      [id, req.user?.id || null, prev.final_home_goals, prev.final_away_goals, final_home_goals, final_away_goals, req.headers['x-forwarded-for'] || req.ip]
    );
    return res.status(409).json({ error: 'El resultado ya fue cargado. Edición bloqueada por política.' });
  }

  // 3) Guardar resultado
  await pool.query('UPDATE matches SET final_home_goals=$1, final_away_goals=$2 WHERE id=$3', [final_home_goals, final_away_goals, id]);

  // 4) Auditoría (set_result)
  await pool.query(
    `INSERT INTO match_audit(match_id, by_user, action, old_home, old_away, new_home, new_away, ip)
     VALUES($1,$2,'set_result',$3,$4,$5,$6,$7)`,
    [id, req.user?.id || null, prev.final_home_goals, prev.final_away_goals, final_home_goals, final_away_goals, req.headers['x-forwarded-for'] || req.ip]
  );

  // 5) Recalcular scores para este partido
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
    await pool.query(
      `INSERT INTO scores(user_id, match_id, points, reason)
       VALUES($1,$2,$3,$4)
       ON CONFLICT (user_id, match_id)
       DO UPDATE SET points=$3, reason=$4`,
       [r.user_id, r.match_id, pts, reason.join('+') || null]
    );
  }

  res.json({ ok: true, updatedScores: rows.length });
});

export default router;
