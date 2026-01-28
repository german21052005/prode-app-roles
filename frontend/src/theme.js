
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1f6feb' },
    secondary: { main: '#7e57c2' },
    success: { main: '#2e7d32' },
    error: { main: '#d32f2f' },
    warning: { main: '#ed6c02' }
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { defaultProps: { variant: 'contained' } },
    MuiTextField: { defaultProps: { size: 'small' } }
  }
});

export default theme;
