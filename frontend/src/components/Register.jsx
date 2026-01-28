
import React, { useState } from 'react';
import api from '../api.js';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Register(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e)=>{
    e.preventDefault(); setError(''); setOk(false);
    try{ await api.post('/auth/register', { username, password }); setOk(true); }
    catch(err){ setError(err.response?.data?.error || 'Error'); }
  };

  return (
    <form onSubmit={submit}>
      <Stack spacing={2}>
        <Typography variant="h6">Registrarse</Typography>
        {ok && <Alert severity="success">Listo. Ahora iniciá sesión.</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Usuario" value={username} onChange={e=>setUsername(e.target.value)} fullWidth />
        <TextField label="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} fullWidth />
        <Button type="submit">Crear cuenta</Button>
      </Stack>
    </form>
  );
}
