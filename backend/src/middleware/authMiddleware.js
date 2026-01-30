
import jwt from 'jsonwebtoken';
import { pool } from '../db.js'; // ajustá si tu db.js está en otro path 

export async function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Asumimos que payload trae { id }
    const r = await pool.query('Select id, username, role from users where id=$1';
    [userid]
    );
   if (r.rowCont === 0) {
     return res.status(401).json({ error: 'Usuario no encontrado' });
   }
     req.user = r.rows[0]; //id, username, role
    next();
  }catch(e){ return res.status(401).json({ error: 'Token inválido' }); }
}
