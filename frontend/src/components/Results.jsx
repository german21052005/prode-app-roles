import { Unstable_Grid2 as Grid } from '@mui/material/Unstable_Grid2';
import React, { useEffect, useMemo, useState } from 'react';
import api from '../api.js';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';

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

  const filtered = useMemo(()=> round==='all' ? matches : matches.filter(m=>m.round===Number(round)), [matches, round]);

  const save = async (m)=>{
    setMsg('');
    const h = parseInt(document.getElementById('rh_'+m.id).value,10);
    const a = parseInt(document.getElementById('ra_'+m.id).value,10);
    if(Number.isNaN(h) || Number.isNaN(a)) { setMsg('Completá ambos resultados'); return; }
    try{
      await api.patch(`/matches/${m.id}/result`, { final_home_goals: h, final_away_goals: a });
      setMsg(`Resultado guardado: ${m.home} ${h}-${a} ${m.away}`);
      await load();
    }catch(e){
      if (e.response?.status === 409) setMsg('El resultado ya fue cargado (bloqueado para evitar re-edición).');
      else setMsg(e.response?.data?.error || 'Error al guardar');
    }
  };

  return (
    <Stack spacing={2}>
      {msg && <Alert severity={msg.startsWith('Resultado guardado')?'success':'warning'}>{msg}</Alert>}
      <Paper sx={{ p:2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h6" sx={{ flexGrow:1 }}>Resultados (Admin)</Typography>
          <Typography variant="body2">Fecha:</Typography>
          <TextField select SelectProps={{ native:true }} size="small" value={round} onChange={e=>setRound(e.target.value)}>
            <option value="all">Todas</option>
            {rounds.map(r=> <option key={r} value={r}>{r}</option>)}
          </TextField>
        </Stack>
      </Paper>

      {filtered.map(m => (
        <Paper key={m.id} sx={{ p:2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs:12, md:4 }}>
              <Typography align="right" fontWeight={600}>{m.home}</Typography>
            </Grid>
            <Grid size={{ xs:12, md:4 }}>
              <Typography>{m.away}</Typography>
              <Typography variant="caption" color="text.secondary">{new Date(m.start_time).toLocaleString()}</Typography>
            </Grid>
            <Grid size={{ xs:12, md:3 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField id={'rh_'+m.id} type="number" inputProps={{ min:0 }} sx={{ width:90 }} defaultValue={m.final_home_goals ?? ''} />
                <Typography>-</Typography>
                <TextField id={'ra_'+m.id} type="number" inputProps={{ min:0 }} sx={{ width:90 }} defaultValue={m.final_away_goals ?? ''} />
              </Stack>
            </Grid>
            <Grid size={{ xs:12, md:1 }}>
              <Button size="small" onClick={()=>save(m)}>Guardar</Button>
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Stack>
  );
}
