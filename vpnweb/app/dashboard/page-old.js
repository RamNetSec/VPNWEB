'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Grid, 
  Avatar, 
  Chip, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  LinearProgress,
  Alert,
  Fade,
  Slide,
  Zoom
} from '@mui/material';
import {
  PersonAdd,
  Person,
  Settings,
  NetworkCheck,
  Dashboard as DashboardIcon,
  ExitToApp,
  Edit,
  Delete,
  VpnKey,
  People,
  Router as RouterIcon,
  Security,
  AdminPanelSettings,
  VerifiedUser,
  Warning,
  TrendingUp
} from '@mui/icons-material';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [vpnStatus, setVpnStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeConnections: 0,
    serverStatus: 'checking'
  });

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (session?.user?.role !== 'admin') {
      router.push('/');
      return;
    }

    // Iniciar animaciones
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);

    fetchUsers();
    fetchVpnStatus();

    return () => clearTimeout(timer);
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setStats(prev => ({ ...prev, totalUsers: data.length }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchVpnStatus = async () => {
    try {
      setStats(prev => ({ ...prev, serverStatus: 'checking' }));
      const response = await fetch('/api/wireguard/status');
      const text = await response.text();
      setVpnStatus(text);
      
      // Simular datos para demo
      setStats(prev => ({
        ...prev,
        activeConnections: Math.floor(Math.random() * 15) + 1,
        serverStatus: text.includes('error') ? 'offline' : 'online'
      }));
    } catch (error) {
      console.error('Error fetching VPN status:', error);
      setStats(prev => ({ ...prev, serverStatus: 'offline' }));
    }
  };

  const handleCreateUser = async () => {
    if (!username.trim() || !email.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(), 
          email: email.trim(), 
          role 
        })
      });

      if (response.ok) {
        setUsername('');
        setEmail('');
        setRole('user');
        setOpenDialog(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (id, newRole) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings />;
      case 'moderator': return <VerifiedUser />;
      default: return <Person />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'moderator': return 'warning';
      default: return 'primary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      default: return 'warning';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'En Línea';
      case 'offline': return 'Desconectado';
      default: return 'Verificando...';
    }
  };

  if (status === 'loading') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <Typography variant="h6">Cargando...</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Fade in={showContent} timeout={800}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        {/* Header mejorado */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 0,
            mb: 4,
          }}
        >
          <Container maxWidth="lg">
            <Slide direction="down" in={showContent} timeout={600}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      width: 64,
                      height: 64,
                      animation: 'pulse 2s infinite',
                    }}
                  >
                    <DashboardIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      Panel VPN
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                      Bienvenido, {session?.user?.name || session?.user?.username}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    icon={getRoleIcon(session?.user?.role)}
                    label={session?.user?.role?.toUpperCase()}
                    color="secondary"
                    sx={{ color: 'white', fontWeight: 600 }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<ExitToApp />}
                    onClick={handleLogout}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Cerrar Sesión
                  </Button>
                </Box>
              </Box>
            </Slide>
          </Container>
        </Paper>

        <Container maxWidth="lg">
          {/* Tarjetas de estadísticas mejoradas */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Zoom in={showContent} timeout={800}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 4,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                          {stats.totalUsers}
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9 }}>
                          Usuarios Totales
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64 }}>
                        <People fontSize="large" />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            <Grid item xs={12} md={4}>
              <Zoom in={showContent} timeout={1000}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    color: 'white',
                    borderRadius: 4,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                          {stats.activeConnections}
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9 }}>
                          Conexiones Activas
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64 }}>
                        <TrendingUp fontSize="large" />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            <Grid item xs={12} md={4}>
              <Zoom in={showContent} timeout={1200}>
                <Card
                  sx={{
                    background: stats.serverStatus === 'online' 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                    color: 'white',
                    borderRadius: 4,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                          {getStatusText(stats.serverStatus)}
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9 }}>
                          Estado del Servidor
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64 }}>
                        <RouterIcon fontSize="large" />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          </Grid>

          {/* Panel de gestión de usuarios mejorado */}
          <Slide direction="up" in={showContent} timeout={1000}>
            <Card
              sx={{
                borderRadius: 4,
                mb: 4,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Security />
                  </Avatar>
                }
                title={
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Gestión de Usuarios
                  </Typography>
                }
                action={
                  <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    Nuevo Usuario
                  </Button>
                }
                sx={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(240,242,247,0.8) 100%)',
                  borderRadius: '16px 16px 0 0',
                }}
              />
              <Divider />
              <CardContent sx={{ p: 4 }}>
                {users.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Avatar sx={{ bgcolor: 'grey.300', width: 100, height: 100, margin: '0 auto 24px' }}>
                      <People fontSize="large" />
                    </Avatar>
                    <Typography variant="h5" sx={{ mb: 2, color: 'text.secondary' }}>
                      No hay usuarios registrados
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Comienza creando tu primer usuario
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {users.map((user, index) => (
                      <Grid item xs={12} sm={6} md={4} key={user.id}>
                        <Zoom in={showContent} timeout={1200 + index * 100}>
                          <Card
                            variant="outlined"
                            sx={{
                              borderRadius: 3,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                                borderColor: 'primary.main',
                              },
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                                  {getRoleIcon(user.role)}
                                </Avatar>
                                <Chip
                                  label={user.role}
                                  color={getRoleColor(user.role)}
                                  size="small"
                                  sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                                />
                              </Box>

                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                {user.username}
                              </Typography>
                              
                              {user.email && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {user.email}
                                </Typography>
                              )}
                              
                              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                                ID: {user.id} • Creado: {new Date(user.created_at).toLocaleDateString()}
                              </Typography>

                              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const newRole = prompt('Nuevo rol (user/moderator/admin):');
                                    if (newRole && ['user', 'moderator', 'admin'].includes(newRole)) {
                                      handleUpdateUser(user.id, newRole);
                                    }
                                  }}
                                  sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'primary.dark' },
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteUser(user.id)}
                                  sx={{
                                    bgcolor: 'error.main',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'error.dark' },
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        </Zoom>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Slide>

          {/* Panel de estado de WireGuard */}
          <Slide direction="up" in={showContent} timeout={1400}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <VpnKey />
                  </Avatar>
                }
                title={
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Estado de WireGuard
                  </Typography>
                }
                action={
                  <Button
                    variant="outlined"
                    onClick={fetchVpnStatus}
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    Actualizar
                  </Button>
                }
                sx={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(240,242,247,0.8) 100%)',
                  borderRadius: '16px 16px 0 0',
                }}
              />
              <Divider />
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <Chip
                    label={getStatusText(stats.serverStatus)}
                    color={getStatusColor(stats.serverStatus)}
                    sx={{ fontWeight: 600, fontSize: '1rem', px: 2, py: 1 }}
                  />
                </Box>

                {vpnStatus ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      backgroundColor: 'grey.50',
                      fontFamily: 'monospace',
                    }}
                  >
                    <Typography
                      variant="body2"
                      component="pre"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        color: 'text.primary',
                      }}
                    >
                      {vpnStatus}
                    </Typography>
                  </Paper>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Haz clic en "Actualizar" para verificar el estado del servidor
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Slide>
        </Container>

        {/* Dialog para crear/editar usuario */}
        <Dialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setEditingUser(null);
            setUsername('');
            setEmail('');
            setRole('user');
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            },
          }}
        >
          <DialogTitle>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </Typography>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Nombre de Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                select
                label="Rol"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                SelectProps={{ native: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <option value="user">Usuario</option>
                <option value="moderator">Moderador</option>
                <option value="admin">Administrador</option>
              </TextField>
            </Box>
            {isLoading && <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => {
                setOpenDialog(false);
                setEditingUser(null);
                setUsername('');
                setEmail('');
                setRole('user');
              }}
              sx={{ borderRadius: 2 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateUser}
              disabled={isLoading || !username.trim() || !email.trim()}
              sx={{
                borderRadius: 2,
                px: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {editingUser ? 'Actualizar' : 'Crear Usuario'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Estilos de animación */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
      </Box>
    </Fade>
  );
}
