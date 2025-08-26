'use client';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TextField, Button, Container, List, ListItem, ListItemText } from '@mui/material';
import { animate as anime } from 'animejs';

export default function Dashboard() {
  const { auth } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('user');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!auth || auth.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchUsers();
    anime({ targets: '#dashboard', opacity: [0, 1], duration: 500 });
  }, [auth, router]);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
  };

  const addUser = async () => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, role })
    });
    if (res.ok) {
      setUsername('');
      setRole('user');
      fetchUsers();
    }
  };

  const deleteUser = async (id) => {
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  const updateUser = async (id) => {
    const newRole = prompt('Nuevo rol:');
    if (!newRole) return;
    await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });
    fetchUsers();
  };

  const checkStatus = async () => {
    const res = await fetch('/api/wireguard/status');
    const text = await res.text();
    setStatus(text);
  };

  return (
    <Container id="dashboard" className="py-8">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <div className="flex gap-2 mb-4">
        <TextField label="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
        <TextField label="Rol" value={role} onChange={(e) => setRole(e.target.value)} />
        <Button variant="contained" onClick={addUser}>Agregar</Button>
      </div>
      <List>
        {users.map((u) => (
          <ListItem key={u.id} className="flex justify-between">
            <ListItemText primary={`${u.username} (${u.role})`} />
            <div className="flex gap-2">
              <Button variant="outlined" onClick={() => updateUser(u.id)}>Editar</Button>
              <Button color="error" onClick={() => deleteUser(u.id)}>Eliminar</Button>
            </div>
          </ListItem>
        ))}
      </List>
      <Button variant="outlined" onClick={checkStatus} className="mt-4">WireGuard Status</Button>
      {status && <pre className="mt-4 bg-gray-100 p-2 rounded whitespace-pre-wrap">{status}</pre>}
    </Container>
  );
}
