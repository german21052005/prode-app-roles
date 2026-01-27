
import React, { useEffect, useState } from 'react';
import api from '../api.js';
export default function Leaderboard(){
  const [rows, setRows] = useState([]);
  useEffect(()=>{ (async()=>{ const { data } = await api.get('/scores'); setRows(data); })(); },[]);
  return (
    <div>
      <h3>Tabla de posiciones</h3>
      <div>
        {rows.map((r,i)=> (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'40px 1fr 80px', gap:8, padding:'6px 0', borderBottom:'1px solid #eee' }}>
            <div>#{i+1}</div>
            <div>{r.username}</div>
            <div style={{ textAlign:'right' }}>{r.total}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
