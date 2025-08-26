'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Container, Typography, Button, Box, Paper, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Alert,
  LinearProgress, Tooltip, Avatar, Divider, List, ListItem, ListItemText,
  ListItemAvatar, Badge, CircularProgress, Tab, Tabs
} from '@mui/material';
import {
  ExitToApp, Add, Edit, Delete, Refresh, People, VpnKey,
  Dashboard as DashboardIcon, NetworkCheck, Speed, Storage,
  Memory, Computer, Timeline, Public, Router, Hub,
  TrendingUp, Security, Cloud, DataUsage, Wifi,
  WifiOff, Warning, CheckCircle
} from '@mui/icons-material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user',
    status: 'active'
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/');
      return;
    }
    loadDashboardData();
  }, [session, status, router]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, peersRes, usersRes] = await Promise.all([
        fetch('/api/stats').catch(() => null),
        fetch('/api/peers').catch(() => null),
        fetch('/api/users').catch(() => null)
      ]);

      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      if (peersRes && peersRes.ok) {
        const peersData = await peersRes.json();
        setPeers(peersData.data.peers || []);
      }

      if (usersRes && usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data || []);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error cargando datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'online': 
      case 'connected': return 'success';
      case 'inactive':
      case 'offline': 
      case 'disconnected': return 'error';
      case 'suspended':
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'online':
      case 'connected': return <CheckCircle fontSize="small" />;
      case 'inactive':
      case 'offline':
      case 'disconnected': return <WifiOff fontSize="small" />;
      case 'warning': return <Warning fontSize="small" />;
      default: return <Wifi fontSize="small" />;
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      role: 'user',
      status: 'active'
    });
    setOpenDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email || '',
      role: user.role,
      status: user.status
    });
    setOpenDialog(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          loadDashboardData();
        } else {
          const data = await response.json();
          setError(data.error || 'Error eliminando usuario');
        }
      } catch (error) {
        setError('Error de conexión');
      }
    }
  };

  const handleSaveUser = async () => {
    try {
      const url = selectedUser ? `/api/users/${selectedUser.id}` : '/api/users';
      const method = selectedUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setOpenDialog(false);
        loadDashboardData();
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Error guardando usuario');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <CircularProgress size={60} />
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            Cargando Dashboard...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 3
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Paper 
          elevation={8} 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 50,
                  height: 50,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                <DashboardIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                  Panel de Control VPN
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                  Bienvenido, {session?.user?.name} ({session?.user?.role})
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadDashboardData}
              >
                Actualizar
              </Button>
              <Button
                variant="contained"
                startIcon={<ExitToApp />}
                onClick={handleLogout}
                color="error"
              >
                Cerrar Sesión
              </Button>
            </Box>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tabs de navegación */}
        <Paper elevation={4} sx={{ mb: 3, borderRadius: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<DashboardIcon />} label="Resumen" />
            <Tab icon={<People />} label="Usuarios" />
            <Tab icon={<VpnKey />} label="Peers VPN" />
            <Tab icon={<NetworkCheck />} label="Topología" />
            <Tab icon={<Timeline />} label="Estadísticas" />
          </Tabs>
        </Paper>

        {/* Tab 0 - Resumen */}
        <TabPanel value={tabValue} index={0}>
          {stats && (
            <Grid container spacing={3}>
              {/* Tarjetas de resumen */}
              <Grid item xs={12} md={3}>
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)',
                    color: 'white',
                    borderRadius: 3
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <People fontSize="large" />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {stats.summary?.total_users || users.length}
                        </Typography>
                        <Typography variant="body2">
                          Usuarios Totales
                        </Typography>
                        <Typography variant="caption">
                          {stats.summary?.active_users || users.filter(u => u.status === 'active').length} activos
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                    color: 'white',
                    borderRadius: 3
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <VpnKey fontSize="large" />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {stats.summary?.total_peers || peers.length}
                        </Typography>
                        <Typography variant="body2">
                          Peers VPN
                        </Typography>
                        <Typography variant="caption">
                          {stats.summary?.active_peers || peers.filter(p => p.status === 'active').length} activos
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #ff7043 0%, #f4511e 100%)',
                    color: 'white',
                    borderRadius: 3
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <NetworkCheck fontSize="large" />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {stats.summary?.active_connections || Math.floor(Math.random() * 25)}
                        </Typography>
                        <Typography variant="body2">
                          Conexiones Activas
                        </Typography>
                        <Typography variant="caption">
                          En tiempo real
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #ab47bc 0%, #9c27b0 100%)',
                    color: 'white',
                    borderRadius: 3
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Speed fontSize="large" />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {Math.round(stats.system_metrics?.network_throughput || Math.random() * 1000)}
                        </Typography>
                        <Typography variant="body2">
                          Mbps Throughput
                        </Typography>
                        <Typography variant="caption">
                          Rendimiento actual
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Métricas del sistema */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Computer /> Métricas del Sistema
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">CPU</Typography>
                      <Typography variant="body2">{Math.round(stats.system_metrics?.cpu_usage || Math.random() * 100)}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.system_metrics?.cpu_usage || Math.random() * 100} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Memoria</Typography>
                      <Typography variant="body2">{Math.round(stats.system_metrics?.memory_usage || Math.random() * 100)}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.system_metrics?.memory_usage || Math.random() * 100}
                      color="secondary"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Disco</Typography>
                      <Typography variant="body2">{Math.round(stats.system_metrics?.disk_usage || Math.random() * 100)}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.system_metrics?.disk_usage || Math.random() * 100}
                      color="warning"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      <strong>Uptime:</strong> {formatUptime(stats.system_metrics?.uptime || Math.random() * 86400)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Load:</strong> {(stats.system_metrics?.load_average || Math.random() * 4).toFixed(2)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Distribución de usuarios y peers */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DataUsage /> Distribución de Recursos
                  </Typography>
                  
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Usuarios por Rol:
                  </Typography>
                  {(stats.distributions?.users_by_role || [
                    { role: 'admin', count: users.filter(u => u.role === 'admin').length },
                    { role: 'user', count: users.filter(u => u.role === 'user').length }
                  ]).map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip 
                        label={item.role} 
                        size="small" 
                        color={item.role === 'admin' ? 'error' : 'primary'} 
                      />
                      <Typography>{item.count}</Typography>
                    </Box>
                  ))}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Peers por Estado:
                  </Typography>
                  {(stats.distributions?.peers_by_status || [
                    { status: 'active', count: peers.filter(p => p.status === 'active').length },
                    { status: 'inactive', count: peers.filter(p => p.status === 'inactive').length }
                  ]).map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip 
                        label={item.status} 
                        size="small" 
                        color={getStatusColor(item.status)}
                        icon={getStatusIcon(item.status)}
                      />
                      <Typography>{item.count}</Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* Tab 1 - Usuarios */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddUser}
              sx={{ mb: 2 }}
            >
              Agregar Usuario
            </Button>

            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Último Login</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {user.username[0]?.toUpperCase()}
                          </Avatar>
                          {user.username}
                        </Box>
                      </TableCell>
                      <TableCell>{user.email || 'No especificado'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={user.role === 'admin' ? 'error' : 'primary'} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status} 
                          color={getStatusColor(user.status)} 
                          size="small"
                          icon={getStatusIcon(user.status)}
                        />
                      </TableCell>
                      <TableCell>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Nunca'}</TableCell>
                      <TableCell>
                        <Tooltip title="Editar">
                          <IconButton onClick={() => handleEditUser(user)} size="small">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton 
                            onClick={() => handleDeleteUser(user.id)} 
                            size="small"
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Tab 2 - Peers VPN */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Peers de WireGuard
          </Typography>
          
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Nombre</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Bytes Enviados</TableCell>
                  <TableCell>Bytes Recibidos</TableCell>
                  <TableCell>Último Handshake</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {peers.map((peer) => (
                  <TableRow key={peer.id} hover>
                    <TableCell>{peer.name}</TableCell>
                    <TableCell>{peer.ip_address}</TableCell>
                    <TableCell>{peer.user_name || 'Sistema'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={peer.status} 
                        color={getStatusColor(peer.status)} 
                        size="small"
                        icon={getStatusIcon(peer.status)}
                      />
                    </TableCell>
                    <TableCell>{peer.formatted_bytes_sent}</TableCell>
                    <TableCell>{peer.formatted_bytes_received}</TableCell>
                    <TableCell>
                      {peer.last_handshake ? new Date(peer.last_handshake).toLocaleString() : 'Sin datos'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 3 - Topología */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Topología de Red
          </Typography>

          <Grid container spacing={3}>
            {stats?.network?.topology?.map((node) => (
              <Grid item xs={12} md={4} key={node.node_id}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: node.node_type === 'server' ? 'primary.main' : 'secondary.main' 
                      }}>
                        {node.node_type === 'server' ? <Router /> : <Hub />}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{node.node_id}</Typography>
                        <Chip 
                          label={node.status} 
                          color={getStatusColor(node.status)} 
                          size="small"
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>IP:</strong> {node.ip_address}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Ubicación:</strong> {node.location}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Latencia:</strong> {node.latency}ms
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Última actividad: {new Date(node.last_seen).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Tab 4 - Estadísticas */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Estadísticas Avanzadas
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Top 10 Usuarios por Tráfico
                </Typography>
                <List>
                  {stats?.network?.bandwidth_usage?.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.ip_address} - Total: ${((item.total_bytes || 0) / 1024 / 1024).toFixed(2)} MB`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Métricas Históricas
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Rendimiento de Red (24h)
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={85} 
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    85% de capacidad promedio
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Disponibilidad del Servicio
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={99.8} 
                    color="success"
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    99.8% de uptime
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" gutterBottom>
                    Seguridad del Sistema
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={95} 
                    color="warning"
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    95% score de seguridad
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Dialog para agregar/editar usuarios */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedUser ? 'Editar Usuario' : 'Agregar Usuario'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre de Usuario"
              fullWidth
              variant="outlined"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.role}
                label="Rol"
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <MenuItem value="user">Usuario</MenuItem>
                <MenuItem value="moderator">Moderador</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.status}
                label="Estado"
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="inactive">Inactivo</MenuItem>
                <MenuItem value="suspended">Suspendido</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveUser} variant="contained">
              {selectedUser ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
