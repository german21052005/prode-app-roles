ar
import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Fixture from './components/Fixture.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import Users from './components/Users.jsx';
import Results from './components/Results.jsx';
import { parseJwt } from './api.js';

function App(){
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => { const t = localStorage.getItem('token'); return t ? parseJwt(t) : null; });
  const [tab, setTab] = useState('fixture');

  const logout = ()=>{ localStorage.removeItem('token'); setToken(null); setUser(null); };

  const handleTab = (_, value)=> setTab(value);

  return (
    <Box sx={{ minHeight:'100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={1} color="default">
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Prode Sinte LPF 2026</Typography>
          <Box sx={{ flexGrow: 1 }} />
          {user && (
            <Typography variant="body2" color="text.secondary">
              Sesión: <b>{user.username}</b> · Rol: <b>{user.role}</b>
            </Typography>
          )}
          {token && <Button size="small" onClick={logout}>Salir</Button>}
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>
        {!token ? (
          <Stack direction={{ xs:'column', md:'row' }} spacing={3}>
            <Paper sx={{ p: 3, flex: 1 }}><Login onLogin={t=>{localStorage.setItem('token', t); setToken(t); setUser(parseJwt(t));}} /></Paper>
            <Paper sx={{ p: 3, flex: 1 }}><Register /></Paper>
          </Stack>
        ) : (
          <>
            <Paper sx={{ mb: 2 }}>
              <Tabs
                value={tab}
                onChange={handleTab}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
              >
                <Tab value="fixture" label="Fixture" />
                <Tab value="leader" label="Tabla" />
                {user?.role==='admin' && <Tab value="users" label="Usuarios" />}
                {user?.role==='admin' && <Tab value="results" label="Resultados" />}
              </Tabs>
            </Paper>

            {tab==='fixture' && <Fixture token={token} user={user} />}
            {tab==='leader'  && <Leaderboard />}
            {tab==='users'   && <Users />}
            {tab==='results' && <Results />}

            <Typography variant="caption" sx={{ mt: 4, display:'block', color:'text.secondary' }}>
              Reglas: 3 pts por acertar resultado (L/E/V) + 3 pts por marcador exacto. Cierre: 30 min antes del inicio.
            </Typography>
          </>
        )}
      </Container>
    </Box>
  );
}

export default App;
