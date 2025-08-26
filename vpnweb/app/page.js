'use client';
import { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { animate as anime } from 'animejs';

export default function LoginPage() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const { setAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    anime({
      targets: '#login-form',
      opacity: [0, 1],
      translateY: [-20, 0],
      duration: 500,
      easing: 'easeOutQuad'
    });
  }, []);

  const handleLogin = () => {
    if (user === 'admin' && pass === 'root') {
      setAuth({ user, role: 'admin' });
      router.push('/dashboard');
    }
  };

  return (
    <Container className="flex items-center justify-center h-screen">
      <form id="login-form" className="flex flex-col gap-4 w-64">
        <Typography variant="h5" className="text-center">Login</Typography>
        <TextField label="Usuario" value={user} onChange={(e) => setUser(e.target.value)} />
        <TextField label="Contraseña" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
        <Button variant="contained" onClick={handleLogin}>Ingresar</Button>
      </form>
    </Container>
  );
}
