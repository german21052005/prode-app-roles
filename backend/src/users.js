
import { Router } from 'express';
import { pool } from './db.js';
import { requireAuth } from './middleware/authMiddleware.js';
import { requireRole } from './middleware/roleMiddleware.js';

const router = Router();

router.get('/', requireAuth, requireRole('admin'), async (_, res) => {
  const r = await pool.query('SELECT id, username, role, created_at FROM users ORDER BY username ASC');
  res.json(r.rows);
});

router.patch('/:id/role', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { role } = req.body; // 'player' | 'admin'
  if (!['player','admin'].includes(role)) return res.status(400).json({ error: 'Rol inválido' });
  await pool.query('UPDATE users SET role=$1 WHERE id=$2', [role, id]);
  res.json({ ok: true });
});

export default router;
