
import Grid from '@mui/material/Unstable_Grid2';
import React, { useEffect, useState } from 'react';
import api from '../api.js';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Fixture({ token, user }){
  const [matches, setMatches] = useState([]);
  const [mine, setMine] = useState({});
  const [msg, setMsg] = useState('');

  const load = async ()=>{
    const m = await api.get('/matches');
    setMatches(m.data);
    const p = await api.get('/predictions/mine');
    const map = {}; for(const r of p.data){ map[r.match_id] = { home_goals: r.home_goals, away_goals: r.away_goals }; }
    setMine(map);
  };
  useEffect(()=>{ load(); },[]);

  const save = async (match_id)=>{
    setMsg('');
    try{
      const h = parseInt(document.getElementById('h_'+match_id).value, 10);
      const a = parseInt(document.getElementById('a_'+match_id).value, 10);
      await api.post('/predictions', { match_id, home_goals: h, away_goals: a });
      setMsg('Guardado');
      await load();
    }catch(err){ setMsg(err.response?.data?.error || 'Error'); }
  };

  return (
    <Stack spacing={2}>
      {msg && <Chip color={msg==='Guardado'?'success':'error'} label={msg} />}
      {matches.map(m => (
        <Card key={m.id} variant="outlined">
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs:12, md:3 }}>
                <Typography align="right" fontWeight={600}>{m.home}</Typography>
              </Grid>
              <Grid size={{ xs:12, md:3 }}>
                <Typography>vs {m.away}</Typography>
              </Grid>
              <Grid size={{ xs:12, md:3 }}>
                <Typography variant="body2" color="text.secondary">{new Date(m.start_time).toLocaleString()}</Typography>
              </Grid>
              <Grid size={{ xs:12, md:2 }}>
                {m.locked ? (
                  <Chip label="Cerrado" color="error" variant="outlined" />
                ) : user?.role === 'admin' ? (
                  <Chip label="Solo gestión (admin)" color="default" variant="outlined" />
                ) : (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField id={'h_'+m.id} type="number" inputProps={{ min:0 }} sx={{ width:90 }} defaultValue={mine[m.id]?.home_goals ?? ''} />
                    <Typography>-</Typography>
                    <TextField id={'a_'+m.id} type="number" inputProps={{ min:0 }} sx={{ width:90 }} defaultValue={mine[m.id]?.away_goals ?? ''} />
                  </Stack>
                )}
              </Grid>
              <Grid size={{ xs:12, md:1 }}>
                {!m.locked && user?.role !== 'admin' && (
                  <Button size="small" onClick={()=>save(m.id)}>Guardar</Button>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
