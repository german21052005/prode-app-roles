
import { Router } from 'express';
import { pool } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/register', async (req, res) => {
  try{
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Datos incompletos' });
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password) VALUES ($1,$2)', [username, hash]);
    res.json({ ok: true });
  }catch(e){
    if (e.code === '23505') return res.status(400).json({ error: 'Usuario existente' });
    console.error(e); res.status(500).json({ error: 'Error interno' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const r = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
  if (r.rowCount === 0) return res.status(400).json({ error: 'Usuario no existe' });
  const user = r.rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Contraseña incorrecta' });
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, role: user.role });
});

export default router;
