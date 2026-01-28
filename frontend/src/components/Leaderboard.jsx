
import React, { useEffect, useState } from 'react';
import api from '../api.js';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function Leaderboard(){
  const [rows, setRows] = useState([]);
  useEffect(()=>{ (async()=>{ const { data } = await api.get('/scores'); setRows(data); })(); },[]);
  return (
    <Paper sx={{ p:2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Tabla de posiciones</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Usuario</TableCell>
            <TableCell align="right">Puntos</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r,i)=> (
            <TableRow key={i}>
              <TableCell>#{i+1}</TableCell>
              <TableCell>{r.username}</TableCell>
              <TableCell align="right">{r.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
