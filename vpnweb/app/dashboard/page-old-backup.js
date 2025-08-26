'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Container, Typography, Button, Box, Paper, Grid, Card, CardContent,
  Chip, IconButton, Alert, Avatar, CircularProgress, Tab, Tabs,
  Tooltip, Badge, Divider
} from '@mui/material';
import {
  ExitToApp, Refresh, People, VpnKey, Dashboard as DashboardIcon,
  NetworkCheck, Timeline, Security, Analytics, Settings,
  Notifications, LocalFireDepartment, Whatshot
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import UserManagement from '../../components/users/UserManagement';
import PeerManagement from '../../components/peers/PeerManagement';
import AdvancedStats from '../../components/stats/AdvancedStats';

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

const FireHeader = ({ user, onRefresh, onLogout }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <Paper 
      elevation={8} 
      sx={{ 
        p: 4,
        mb: 3, 
        borderRadius: 4,
        background: 'linear-gradient(135deg, rgba(26,26,26,0.95) 0%, rgba(38,38,38,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 69, 0, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="fire-particles"
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Avatar
              sx={{
                width: 70,
                height: 70,
                background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 50%, #ff8c00 100%)',
                boxShadow: '0 0 30px rgba(255, 69, 0, 0.8)',
                border: '3px solid rgba(255, 255, 255, 0.2)'
              }}
              className="animate-fire-pulse"
            >
              <LocalFireDepartment fontSize="large" />
            </Avatar>
          </motion.div>
          
          <Box>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 50%, #ff8c00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(255, 69, 0, 0.5)',
                mb: 1
              }}
            >
              FIRE VPN Control
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                Bienvenido,{' '}
                <Box component="span" sx={{ color: '#ff4500', fontWeight: 700 }}>
                  {user?.name}
                </Box>
              </Typography>
              
              <Chip
                label={user?.role?.toUpperCase()}
                size="small"
                sx={{
                  background: user?.role === 'admin' 
                    ? 'linear-gradient(135deg, #ff4500 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: '0 0 15px rgba(255, 69, 0, 0.6)',
                  '& .MuiChip-label': {
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }
                }}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Tooltip title="Actualizar datos">
              <IconButton
                onClick={onRefresh}
                sx={{
                  background: 'linear-gradient(135deg, rgba(255, 69, 0, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
                  color: '#ff4500',
                  border: '1px solid rgba(255, 69, 0, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(255, 69, 0, 0.3) 0%, rgba(220, 38, 38, 0.3) 100%)',
                    transform: 'rotate(180deg)',
                    boxShadow: '0 0 20px rgba(255, 69, 0, 0.6)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              startIcon={<ExitToApp />}
              onClick={onLogout}
              sx={{
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
                py: 1,
                '&:hover': {
                  background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                  boxShadow: '0 0 20px rgba(220, 38, 38, 0.6)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
              className="btn-fire"
            >
              Cerrar Sesión
            </Button>
          </motion.div>
        </Box>
      </Box>
    </Paper>
  </motion.div>
);

const FireTabs = ({ value, onChange }) => {
  const tabs = [
    { icon: DashboardIcon, label: 'Dashboard', color: '#ff4500' },
    { icon: People, label: 'Usuarios', color: '#22c55e' },
    { icon: VpnKey, label: 'Peers VPN', color: '#3b82f6' },
    { icon: NetworkCheck, label: 'Red', color: '#8b5cf6' },
    { icon: Analytics, label: 'Análisis', color: '#f59e0b' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Paper 
        elevation={6} 
        sx={{ 
          mb: 3, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(26,26,26,0.9) 0%, rgba(38,38,38,0.8) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 69, 0, 0.2)',
          overflow: 'hidden'
        }}
      >
        <Tabs 
          value={value} 
          onChange={onChange}
          variant="fullWidth"
          sx={{ 
            borderBottom: '1px solid rgba(255, 69, 0, 0.2)',
            '& .MuiTab-root': {
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              py: 2,
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                color: '#ff4500',
                background: 'rgba(255, 69, 0, 0.1)',
                transform: 'translateY(-2px)'
              },
              '&.Mui-selected': {
                color: '#ff4500',
                background: 'linear-gradient(135deg, rgba(255, 69, 0, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
                boxShadow: '0 0 20px rgba(255, 69, 0, 0.3)'
              }
            },
            '& .MuiTabs-indicator': {
              height: 3,
              background: 'linear-gradient(90deg, #ff4500 0%, #ff6347 100%)',
              boxShadow: '0 0 10px rgba(255, 69, 0, 0.8)'
            }
          }}
        >
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <Tab
                key={index}
                icon={<Icon />}
                label={tab.label}
                sx={{
                  '& .MuiSvgIcon-root': {
                    mb: 0.5,
                    fontSize: '1.5rem'
                  }
                }}
              />
            );
          })}
        </Tabs>
      </Paper>
    </motion.div>
  );
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/');
      return;
    }
    loadDashboardData();
  }, [session, status, router]);

  const loadDashboardData = async () => {
    setRefreshing(true);
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
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  if (loading && !refreshing) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          position: 'relative'
        }}
        className="fire-particles"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Paper 
            sx={{ 
              p: 6, 
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(26,26,26,0.9) 0%, rgba(38,38,38,0.8) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 69, 0, 0.3)',
              textAlign: 'center',
              boxShadow: '0 0 50px rgba(255, 69, 0, 0.3)'
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
                  mx: 'auto',
                  mb: 3,
                  boxShadow: '0 0 30px rgba(255, 69, 0, 0.8)'
                }}
              >
                <Whatshot fontSize="large" />
              </Avatar>
            </motion.div>
            
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 2,
                background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold'
              }}
            >
              Iniciando Fire VPN
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                mb: 3
              }}
            >
              Cargando dashboard de administración...
            </Typography>
            
            <Box sx={{ width: 200, mx: 'auto' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Box
                  sx={{
                    height: 4,
                    background: 'linear-gradient(90deg, #ff4500 0%, #ff6347 100%)',
                    borderRadius: 2,
                    boxShadow: '0 0 10px rgba(255, 69, 0, 0.8)'
                  }}
                />
              </motion.div>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        py: 3,
        position: 'relative'
      }}
      className="fire-particles"
    >
      <Container maxWidth="xl">
        {/* Header */}
        <FireHeader
          user={session?.user}
          onRefresh={loadDashboardData}
          onLogout={handleLogout}
        />

        {/* Alerta de error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 3,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444'
                }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicador de actualización */}
        <AnimatePresence>
          {refreshing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}
            >
              <Paper
                sx={{
                  p: 2,
                  background: 'linear-gradient(135deg, rgba(255, 69, 0, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  boxShadow: '0 0 30px rgba(255, 69, 0, 0.6)'
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Refresh sx={{ color: 'white' }} />
                </motion.div>
                <Typography sx={{ color: 'white', fontWeight: 600 }}>
                  Actualizando...
                </Typography>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs de navegación */}
        <FireTabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} />

        {/* Contenido de tabs */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tabValue}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Tab 0 - Dashboard Principal */}
            <TabPanel value={tabValue} index={0}>
              <AdvancedStats
                stats={stats}
                onRefresh={loadDashboardData}
                loading={refreshing}
              />
            </TabPanel>

            {/* Tab 1 - Gestión de Usuarios */}
            <TabPanel value={tabValue} index={1}>
              <UserManagement
                users={users}
                onRefresh={loadDashboardData}
                loading={refreshing}
              />
            </TabPanel>

            {/* Tab 2 - Gestión de Peers VPN */}
            <TabPanel value={tabValue} index={2}>
              <PeerManagement
                peers={peers}
                onRefresh={loadDashboardData}
                loading={refreshing}
              />
            </TabPanel>

            {/* Tab 3 - Topología de Red */}
            <TabPanel value={tabValue} index={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(26,26,26,0.9) 0%, rgba(38,38,38,0.8) 100%)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 69, 0, 0.3)',
                    textAlign: 'center'
                  }}
                >
                  <NetworkCheck sx={{ fontSize: 80, color: 'rgba(255, 69, 0, 0.6)', mb: 2 }} />
                  <Typography
                    variant="h4"
                    sx={{
                      background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 'bold',
                      mb: 2
                    }}
                  >
                    Topología de Red
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Visualización avanzada de la red VPN en desarrollo
                  </Typography>
                </Paper>
              </motion.div>
            </TabPanel>

            {/* Tab 4 - Análisis Avanzado */}
            <TabPanel value={tabValue} index={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, rgba(26,26,26,0.9) 0%, rgba(38,38,38,0.8) 100%)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 69, 0, 0.3)',
                    textAlign: 'center'
                  }}
                >
                  <Analytics sx={{ fontSize: 80, color: 'rgba(255, 69, 0, 0.6)', mb: 2 }} />
                  <Typography
                    variant="h4"
                    sx={{
                      background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 'bold',
                      mb: 2
                    }}
                  >
                    Análisis Avanzado
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Herramientas de análisis y reportes detallados en desarrollo
                  </Typography>
                </Paper>
              </motion.div>
            </TabPanel>
          </motion.div>
        </AnimatePresence>
        
        {/* Footer con atribución */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <Box
            sx={{
              mt: 6,
              py: 3,
              borderTop: '1px solid rgba(255, 69, 0, 0.3)',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.6)',
                mb: 1,
              }}
            >
              © 2025 Fire VPN Control - Panel de administración de alta seguridad
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.75rem',
              }}
            >
              Powered by{' '}
              <Box
                component="span"
                sx={{
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                VPNWEB
              </Box>
              {' '}• Desarrollado por{' '}
              <Box
                component="span"
                sx={{
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                RamNetSec
              </Box>
            </Typography>
          </Box>
        </motion.div>
      </Container>
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
        
        {/* Footer con atribución */}
        <Box
          sx={{
            mt: 6,
            py: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 1,
            }}
          >
            © 2025 VPN Admin Panel - Panel de administración seguro
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
            }}
          >
            Basado en{' '}
            <Box
              component="span"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
              }}
            >
              VPNWEB
            </Box>
            background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              RamNetSec
            </Box>
          </Typography>
        </Box>
      </motion.div>
    </Container>
  </Box>
);
}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
