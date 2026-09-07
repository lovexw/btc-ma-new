import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#FF9900' },
    success: { main: '#2E7D32' },
    error: { main: '#C62828' },
    background: { default: '#F6F7F9', paper: '#FFFFFF' },
    text: { primary: '#1A1A1A', secondary: '#667085' },
    divider: '#E7E9EE'
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700 }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #E7E9EE',
          backgroundImage: 'none',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.06)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          '@media (hover: hover)': {
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(16, 24, 40, 0.10)'
            }
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' }
      }
    }
  }
});
