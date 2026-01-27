
import React, { useEffect, useState } from 'react';
import api from '../api.js';
export default function Fixture(){
  const [matches, setMatches] = useState([]);
  const [mine, setMine] = useState({});
  const [msg, setMsg] = useState('');
  const load = async ()=>{
    const m = await api.get('/matches'); setMatches(m.data);
    const p = await api.get('/predictions/mine'); const map = {}; for(const r of p.data){ map[r.match_id] = { home_goals: r.home_goals, away_goals: r.away_goals }; } setMine(map);
  };
  useEffect(()=>{ load(); },[]);
  const save = async (match_id)=>{ setMsg(''); try{ const h = parseInt(document.getElementById('h_'+match_id).value,10); const a = parseInt(document.getElementById('a_'+match_id).value,10); await api.post('/predictions', { match_id, home_goals: h, away_goals: a }); setMsg('Guardado'); await load(); }catch(err){ setMsg(err.response?.data?.error || 'Error'); } };
  return (
    <div>
      <h3>Fixture & Pronósticos</h3>
      {msg && <div style={{ color: msg==='Guardado'?'green':'red' }}>{msg}</div>}
      {matches.map(m => (
        <div key={m.id} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 140px 140px 100px', alignItems:'center', gap:8, borderBottom:'1px solid #eee', padding:'8px 0' }}>
          <div style={{ textAlign:'right' }}>{m.home}</div>
          <div style={{ textAlign:'left' }}>vs {m.away}</div>
          <div>{new Date(m.start_time).toLocaleString()}</div>
          <div>
            {m.locked ? (<span style={{ color:'#b00' }}>Cerrado</span>) : (
              <>
                <input id={'h_'+m.id} type="number" min="0" style={{ width:60 }} defaultValue={mine[m.id]?.home_goals ?? ''} />
                <span style={{ margin: '0 6px' }}>-</span>
                <input id={'a_'+m.id} type="number" min="0" style={{ width:60 }} defaultValue={mine[m.id]?.away_goals ?? ''} />
              </>
            )}
          </div>
          <div>
            {!m.locked && <button onClick={()=>save(m.id)}>Guardar</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
