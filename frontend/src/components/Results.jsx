import React, { useEffect, useMemo, useState } from 'react';
import api from '../api.js';

export default function Results(){
  const [matches, setMatches] = useState([]);
  const [msg, setMsg] = useState('');
  const [round, setRound] = useState('all');

  const load = async ()=>{
    setMsg('');
    const { data } = await api.get('/matches');
    setMatches(data);
  };

  useEffect(()=>{ load(); },[]);

  const rounds = useMemo(()=>{
    const set = new Set(matches.map(m=>m.round).filter(x=>x!=null));
    return Array.from(set).sort((a,b)=>a-b);
  },[matches]);

  const filtered = useMemo(()=>{
    return round==='all' ? matches : matches.filter(m=>m.round===Number(round));
  },[matches, round]);

  const save = async (m)=>{
    setMsg('');
    const h = parseInt(document.getElementById('rh_'+m.id).value,10);
    const a = parseInt(document.getElementById('ra_'+m.id).value,10);
    if(Number.isNaN(h) || Number.isNaN(a)) { setMsg('Completá ambos resultados'); return; }
    try{
      await api.patch(`/matches/${m.id}/result`, { final_home_goals: h, final_away_goals: a });
      setMsg(`Resultado guardado: ${m.home} ${h}-${a} ${m.away}`);
      await load();
    }catch(e){ setMsg(e.response?.data?.error || 'Error al guardar'); }
  };

  return (
    <div>
      <h3>Resultados (Admin)</h3>
      {msg && <div style={{ marginBottom:8, color: msg.startsWith('Resultado guardado')?'green':'#b00' }}>{msg}</div>}

      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:12 }}>
        <label>Fecha:</label>
        <select value={round} onChange={e=>setRound(e.target.value)}>
          <option value="all">Todas</option>
          {rounds.map(r=> <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 150px 160px 120px', gap:8, borderBottom:'1px solid #eee', paddingBottom:6, fontWeight:600 }}>
        <div>Local</div>
        <div>Visitante</div>
        <div>Inicio</div>
        <div>Resultado final</div>
        <div>Acción</div>
      </div>

      {filtered.map(m => (
        <div key={m.id} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 150px 160px 120px', gap:8, alignItems:'center', borderBottom:'1px solid #f2f2f2', padding:'8px 0' }}>
          <div style={{ textAlign:'right' }}>{m.home}</div>
          <div>{m.away}</div>
          <div>{new Date(m.start_time).toLocaleString()}</div>
          <div>
            <input id={'rh_'+m.id} type="number" min="0" defaultValue={m.final_home_goals ?? ''} style={{ width:60 }} />
            <span style={{ margin:'0 6px' }}>-</span>
            <input id={'ra_'+m.id} type="number" min="0" defaultValue={m.final_away_goals ?? ''} style={{ width:60 }} />
          </div>
          <div>
            <button onClick={()=>save(m)}>Guardar</button>
          </div>
        </div>
      ))}
    </div>
  );
}
