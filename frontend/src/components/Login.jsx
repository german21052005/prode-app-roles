
import React, { useState } from 'react';
import api from '../api.js';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Login({ onLogin }){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e)=>{
    e.preventDefault();
    setError('');
    try{
      const { data } = await api.post('/auth/login', { username, password });
      onLogin(data.token);
    }catch(err){ setError(err.response?.data?.error || 'Error'); }
  };

  return (
    <form onSubmit={submit}>
      <Stack spacing={2}>
        <Typography variant="h6">Ingresar</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Usuario" value={username} onChange={e=>setUsername(e.target.value)} fullWidth />
        <TextField label="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} fullWidth />
        <Button type="submit">Entrar</Button>
      </Stack>
    </form>
  );
}
