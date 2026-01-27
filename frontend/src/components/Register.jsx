
import React, { useState } from 'react';
import api from '../api.js';
export default function Register(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e)=>{ e.preventDefault(); setError(''); setOk(false); try{ await api.post('/auth/register', { username, password }); setOk(true); }catch(err){ setError(err.response?.data?.error || 'Error'); } };
  return (
    <form onSubmit={submit} style={{ border:'1px solid #ddd', padding:16, borderRadius:8 }}>
      <h3>Registrarse</h3>
      <input placeholder="usuario" value={username} onChange={e=>setUsername(e.target.value)} />
      <input placeholder="contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button type="submit">Crear cuenta</button>
      {ok && <div style={{ color:'green' }}>Listo. Ahora iniciá sesión.</div>}
      {error && <div style={{ color:'red' }}>{error}</div>}
    </form>
  );
}
