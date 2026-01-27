
export function requireRole(role) {
  return (req, res, next) => {
    const adminKey = req.headers['x-admin-key'];
    if (process.env.ADMIN_KEY && adminKey === process.env.ADMIN_KEY) return next();
    if (!req.user || !req.user.role) return res.status(403).json({ error: 'No autorizado' });
    if (req.user.role !== role) return res.status(403).json({ error: 'Requiere rol ' + role });
    next();
  };
}
