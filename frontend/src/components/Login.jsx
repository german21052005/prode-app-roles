
import React, { useState } from 'react';
import api from '../api.js';
export default function Login({ onLogin }){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = async (e)=>{ e.preventDefault(); setError(''); try{ const { data } = await api.post('/auth/login', { username, password }); onLogin(data.token); }catch(err){ setError(err.response?.data?.error || 'Error'); } };
  return (
    <form onSubmit={submit} style={{ border:'1px solid #ddd', padding:16, borderRadius:8 }}>
      <h3>Ingresar</h3>
      <input placeholder="usuario" value={username} onChange={e=>setUsername(e.target.value)} />
      <input placeholder="contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button type="submit">Entrar</button>
      {error && <div style={{ color:'red' }}>{error}</div>}
    </form>
  );
}
