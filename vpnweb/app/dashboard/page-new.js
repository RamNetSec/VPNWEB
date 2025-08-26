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
