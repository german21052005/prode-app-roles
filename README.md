
# Prode LPF 2026

App web para prode entre amigos.

- **Reglas**: 3 pts por signo (L/E/V) + 3 pts por resultado exacto. Cierre: 30 min antes de cada partido.
- **Stack**: Node.js (Express) + PostgreSQL + React (Vite)
- **Deploy**: Render (Blueprint incluido)

## Deploy rápido en Render
1. Subí este repo a GitHub.
2. En Render: **New + → Blueprint** y apuntá al repo. Se crean: backend (web), frontend (static) y DB Postgres.
3. Cuando termine el backend, configurá en el frontend `VITE_API_URL` con la URL del backend y hacé **Rebuild**.

## Variables de entorno
Backend (`/backend/.env`):
```
PORT=3000
DATABASE_URL=postgres://user:pass@host:5432/db
JWT_SECRET=changeme
ADMIN_KEY=changeme_admin
ADMIN_SEED_USER=admin
ADMIN_SEED_PASS=changeme123
```
Frontend (`/frontend/.env`):
```
VITE_API_URL=https://<tu-backend>.onrender.com
```

## Roles
- **player**: crea/edita sus pronósticos mientras no esté bloqueado.
- **admin**: además, carga resultados (`PATCH /matches/:id/result`) y administra roles (`GET /users`, `PATCH /users/:id/role`).

**Primer admin**: definí `ADMIN_SEED_USER` y `ADMIN_SEED_PASS` antes del primer boot, o usá temporalmente `x-admin-key` si configuraste `ADMIN_KEY`.

## Endpoints
- `POST /auth/register` · `POST /auth/login`
- `GET /matches`
- `GET /predictions/mine` · `POST /predictions`
- `PATCH /matches/:id/result` *(admin)*
- `GET /scores` · `POST /scores/recalc`
- `GET /users` *(admin)* · `PATCH /users/:id/role` *(admin)*
