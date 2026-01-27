
import React, { useEffect, useState } from 'react';
import api from '../api.js';
export default function Users(){
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');
  const load = async ()=>{ try{ const { data } = await api.get('/users'); setRows(data); }catch(e){ setMsg(e.response?.data?.error || 'Error'); } };
  useEffect(()=>{ load(); },[]);
  const changeRole = async (id, role)=>{ setMsg(''); try{ await api.patch(`/users/${id}/role`, { role }); setMsg('Rol actualizado'); await load(); }catch(e){ setMsg(e.response?.data?.error || 'Error'); } };
  return (
    <div>
      <h3>Usuarios</h3>
      {msg && <div style={{ color: msg.includes('actualizado') ? 'green' : 'red' }}>{msg}</div>}
      <div style={{display:'grid', gridTemplateColumns:'60px 1fr 160px 200px', gap:8}}>
        <div><b>ID</b></div><div><b>Usuario</b></div><div><b>Rol</b></div><div><b>Acciones</b></div>
        {rows.map(u => (
          <React.Fragment key={u.id}>
            <div>#{u.id}</div>
            <div>{u.username}</div>
            <div>{u.role}</div>
            <div>
              <button disabled={u.role==='admin'} onClick={()=>changeRole(u.id,'admin')}>Hacer admin</button>
              <button disabled={u.role==='player'} onClick={()=>changeRole(u.id,'player')} style={{marginLeft:8}}>Hacer jugador</button>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
