'use client';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';

export default function LoadingSpinner({ message = "Cargando..." }) {
  return (
    <Fade in={true} timeout={300}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="200px"
        gap={2}
      >
        <CircularProgress 
          size={48}
          thickness={4}
          sx={{
            color: 'var(--primary)',
          }}
        />
        <Typography 
          variant="body1" 
          color="textSecondary"
          sx={{ fontWeight: 500 }}
        >
          {message}
        </Typography>
      </Box>
    </Fade>
  );
}

export function FullPageLoader({ message = "Cargando aplicación..." }) {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--background)',
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          p: 4,
          borderRadius: '20px',
          background: 'var(--card-bg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)',
        }}
      >
        <CircularProgress 
          size={56}
          thickness={3.5}
          sx={{
            color: 'var(--primary)',
          }}
        />
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'var(--foreground)',
            fontWeight: 600,
            textAlign: 'center'
          }}
        >
          {message}
        </Typography>
      </Box>
    </Box>
  );
}
