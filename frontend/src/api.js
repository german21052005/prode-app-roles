
import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000' });
api.interceptors.request.use((config)=>{ const t = localStorage.getItem('token'); if (t) config.headers.Authorization = `Bearer ${t}`; return config; });
export default api;
export function parseJwt(token){ try{ const b = token.split('.')[1]; return JSON.parse(atob(b.replace(/-/g,'+').replace(/_/g,'/'))); }catch{ return {}; } }
