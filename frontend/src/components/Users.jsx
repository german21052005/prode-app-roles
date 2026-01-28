
import React, { useEffect, useState } from 'react';
import api from '../api.js';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

export default function Users(){
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');

  const load = async ()=>{
    try{ const { data } = await api.get('/users'); setRows(data); }
    catch(e){ setMsg(e.response?.data?.error || 'Error'); }
  };
  useEffect(()=>{ load(); },[]);

  const changeRole = async (id, role)=>{
    setMsg('');
    try{ await api.patch(`/users/${id}/role`, { role }); setMsg('Rol actualizado'); await load(); }
    catch(e){ setMsg(e.response?.data?.error || 'Error'); }
  };

  return (
    <Paper sx={{ p:2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Usuarios</Typography>
        {msg && <Alert severity={msg.includes('actualizado') ? 'success':'error'}>{msg}</Alert>}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(u => (
              <TableRow key={u.id}>
                <TableCell>#{u.id}</TableCell>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" disabled={u.role==='admin'} onClick={()=>changeRole(u.id,'admin')}>Hacer admin</Button>
                    <Button size="small" disabled={u.role==='player'} onClick={()=>changeRole(u.id,'player')}>Hacer jugador</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    </Paper>
  );
}
