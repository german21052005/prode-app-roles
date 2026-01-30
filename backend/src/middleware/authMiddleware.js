
import jwt from 'jsonwebtoken';
//import { pool } from '../db.js'; // ajustá si tu db.js está en otro path 

export function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'No autorizado' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, username, role, iat, exp }
    return next();
  } catch (e) {
    console.error("JWT_VERIFY_ERROR:", e.message);
    return res.status(401).json({ error: 'Token inválido' });
  }
}


