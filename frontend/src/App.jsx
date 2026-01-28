
import React, { useState } from 'react';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Fixture from './components/Fixture.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import Users from './components/Users.jsx';
import Results from './components/Results.jsx';
import { parseJwt } from './api.js';

function App(){
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => { const t = localStorage.getItem('token'); return t ? parseJwt(t) : null; });
  const [tab, setTab] = useState('fixture');
  const logout = ()=>{ localStorage.removeItem('token'); setToken(null); setUser(null); };
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto', maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <h1>Prode LPF 2026</h1>
      {user && <div style={{color:'#666'}}>Sesión: <b>{user.username}</b> · Rol: <b>{user.role}</b></div>}
      {!token ? (
        <div style={{ display: 'flex', gap: 24 }}>
          <Login onLogin={t=>{localStorage.setItem('token', t); setToken(t); setUser(parseJwt(t));}} />
          <Register />
        </div>
      ) : (
        <>
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            <button onClick={()=>setTab('fixture')}>Fixture</button>
            <button onClick={()=>setTab('leader')}>Tabla</button>
            {user?.role==='admin' && <>
			<button onClick={()=>setTab('users')}>Usuarios</button>
			<button onClick={()=>setTab('results')}>Resultados</button> 
            <button onClick={logout} style={{ marginLeft:'auto' }}>Salir</button>
			</>}
          </div>
          {tab==='fixture' ? <Fixture token={token} user={user} /> : (tab==='leader' ? <Leaderboard /> : (tab==='users'?<Users />:<Results/>))}
        </>
      )}
      <p style={{marginTop:24, color:'#666'}}>Reglas: 3 pts por acertar signo (L/E/V) + 3 pts por resultado exacto. Cierre: 30 min antes del inicio.</p>
    </div>
  );
}
export default App;
