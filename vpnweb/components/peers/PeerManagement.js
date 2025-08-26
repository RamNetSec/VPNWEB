'use client';
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, Card, CardContent,
  Avatar, Badge, Tooltip, LinearProgress, Alert, FormControl, InputLabel,
  Select, MenuItem, Switch, FormControlLabel, Divider, List, ListItem,
  ListItemText, ListItemAvatar, InputAdornment
} from '@mui/material';
import {
  Add, Edit, Delete, Refresh, VpnKey, NetworkCheck, Speed, DataUsage,
  Router, Computer, Smartphone, Tablet, DesktopMac, PhoneIphone,
  CheckCircle, Error, Warning, Block, PlayArrow, Stop, GetApp,
  Upload, Download, Timeline, Visibility, Search, FilterList
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { FireAreaChart, FireLineChart, FireBarChart } from '../charts/FireChart';

const PeerStatusIndicator = ({ status, lastHandshake }) => {
  const getStatusConfig = () => {
    if (!lastHandshake) {
      return { color: '#6b7280', icon: Block, label: 'Sin conexión', glow: '0 0 10px rgba(107, 114, 128, 0.6)' };
    }

    const now = new Date();
    const handshakeTime = new Date(lastHandshake);
    const timeDiff = now - handshakeTime;
    const minutesDiff = timeDiff / (1000 * 60);

    if (minutesDiff < 5) {
      return { color: '#22c55e', icon: CheckCircle, label: 'Conectado', glow: '0 0 15px rgba(34, 197, 94, 0.8)' };
    } else if (minutesDiff < 30) {
      return { color: '#eab308', icon: Warning, label: 'Inactivo', glow: '0 0 15px rgba(234, 179, 8, 0.8)' };
    } else {
      return { color: '#ef4444', icon: Error, label: 'Desconectado', glow: '0 0 15px rgba(239, 68, 68, 0.8)' };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Chip
      icon={<Icon fontSize="small" />}
      label={config.label}
      size="small"
      sx={{
        backgroundColor: `${config.color}22`,
        color: config.color,
        border: `1px solid ${config.color}44`,
        fontWeight: 'bold',
        boxShadow: config.glow,
        animation: config.label === 'Conectado' ? 'pulse 2s ease-in-out infinite' : 'none',
        '& .MuiChip-icon': {
          color: config.color
        }
      }}
    />
  );
};

const DeviceTypeIcon = ({ clientType }) => {
  const getDeviceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'mobile':
      case 'android':
      case 'ios': return PhoneIphone;
      case 'tablet': return Tablet;
      case 'desktop':
      case 'windows':
      case 'linux': return DesktopMac;
      case 'router': return Router;
      default: return Computer;
    }
  };

  const Icon = getDeviceIcon(clientType);
  
  return (
    <Avatar
      sx={{
        width: 32,
        height: 32,
        background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
        boxShadow: '0 0 10px rgba(255, 69, 0, 0.6)'
      }}
    >
      <Icon fontSize="small" />
    </Avatar>
  );
};

const DataUsageCard = ({ label, value, unit, icon: Icon, color }) => {
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div whileHover={{ scale: 1.05 }}>
      <Card
        sx={{
          background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
          border: `1px solid ${color}44`,
          borderRadius: 2,
          height: '100%'
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Icon fontSize="small" sx={{ color: color }} />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {label}
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: color, fontWeight: 'bold' }}>
            {typeof value === 'number' ? formatBytes(value) : value}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const PeerCard = ({ peer, onEdit, onDelete, onToggleStatus, onViewDetails }) => {
  const isActive = peer.status === 'active';
  const totalTraffic = (peer.transfer_tx || 0) + (peer.transfer_rx || 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(26,26,26,0.9) 0%, rgba(38,38,38,0.8) 100%)',
          border: '1px solid rgba(255, 69, 0, 0.3)',
          borderRadius: 3,
          backdropFilter: 'blur(16px)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            border: '1px solid rgba(255, 69, 0, 0.6)',
            boxShadow: '0 0 30px rgba(255, 69, 0, 0.3)'
          },
          transition: 'all 0.3s ease'
        }}
        className="fire-particles"
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: isActive ? '#22c55e' : '#ef4444',
                    border: '2px solid #1a1a1a',
                    boxShadow: `0 0 10px ${isActive ? '#22c55e' : '#ef4444'}`
                  }}
                />
              }
            >
              <DeviceTypeIcon clientType={peer.client_type} />
            </Badge>
            
            <Box sx={{ ml: 2, flex: 1 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                {peer.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {peer.ip_address}
              </Typography>
            </Box>

            <PeerStatusIndicator
              status={peer.status}
              lastHandshake={peer.latest_handshake}
            />
          </Box>

          <Divider sx={{ my: 2, borderColor: 'rgba(255, 69, 0, 0.2)' }} />

          {/* Información del usuario */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
              <strong>Usuario:</strong> {peer.user_name || 'Sistema'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
              <strong>Endpoint:</strong> {peer.endpoint || 'No disponible'}
            </Typography>
            {peer.latest_handshake && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                <strong>Último handshake:</strong> {new Date(peer.latest_handshake).toLocaleString()}
              </Typography>
            )}
          </Box>

          {/* Estadísticas de tráfico */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <DataUsageCard
                label="Enviado"
                value={peer.transfer_tx || 0}
                icon={Upload}
                color="#22c55e"
              />
            </Grid>
            <Grid item xs={6}>
              <DataUsageCard
                label="Recibido"
                value={peer.transfer_rx || 0}
                icon={Download}
                color="#3b82f6"
              />
            </Grid>
          </Grid>

          {/* Barra de uso total */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Tráfico Total
              </Typography>
              <Typography variant="caption" sx={{ color: '#ff4500', fontWeight: 'bold' }}>
                {(totalTraffic / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min((totalTraffic / (1024 * 1024 * 100)) * 100, 100)}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #ff4500 0%, #ff6347 100%)',
                  boxShadow: '0 0 10px rgba(255, 69, 0, 0.6)'
                }
              }}
            />
          </Box>

          {/* Controles */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => onToggleStatus(peer.id, e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#22c55e',
                      '& + .MuiSwitch-track': {
                        backgroundColor: '#22c55e',
                      },
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {isActive ? 'Activo' : 'Inactivo'}
                </Typography>
              }
            />
            
            <Box>
              <Tooltip title="Ver detalles">
                <IconButton
                  onClick={() => onViewDetails(peer)}
                  sx={{
                    color: '#3b82f6',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
                    }
                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Editar peer">
                <IconButton
                  onClick={() => onEdit(peer)}
                  sx={{
                    color: '#ff4500',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 69, 0, 0.1)',
                      boxShadow: '0 0 15px rgba(255, 69, 0, 0.4)'
                    }
                  }}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Eliminar peer">
                <IconButton
                  onClick={() => onDelete(peer.id, peer.name)}
                  sx={{
                    color: '#ef4444',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
                    }
                  }}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const PeerDetailsDialog = ({ peer, open, onClose }) => {
  if (!peer) return null;

  const trafficData = [
    { name: 'Última hora', upload: Math.random() * 100, download: Math.random() * 150 },
    { name: '2h atrás', upload: Math.random() * 80, download: Math.random() * 120 },
    { name: '3h atrás', upload: Math.random() * 60, download: Math.random() * 90 },
    { name: '4h atrás', upload: Math.random() * 40, download: Math.random() * 70 },
    { name: '5h atrás', upload: Math.random() * 30, download: Math.random() * 50 },
    { name: '6h atrás', upload: Math.random() * 20, download: Math.random() * 30 }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(26,26,26,0.95) 0%, rgba(38,38,38,0.95) 100%)',
          border: '1px solid rgba(255, 69, 0, 0.3)',
          borderRadius: 3,
          backdropFilter: 'blur(20px)',
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          color: 'white',
          borderBottom: '1px solid rgba(255, 69, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <DeviceTypeIcon clientType={peer.client_type} />
        Detalles del Peer: {peer.name}
        <PeerStatusIndicator status={peer.status} lastHandshake={peer.latest_handshake} />
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Información básica */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                background: 'rgba(26,26,26,0.8)',
                border: '1px solid rgba(255, 69, 0, 0.3)',
                borderRadius: 2
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold'
                }}
              >
                Información del Peer
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText
                    primary="Nombre"
                    secondary={peer.name}
                    sx={{
                      '& .MuiListItemText-primary': { color: 'rgba(255,255,255,0.8)' },
                      '& .MuiListItemText-secondary': { color: 'white', fontWeight: 'bold' }
                    }}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Dirección IP"
                    secondary={peer.ip_address}
                    sx={{
                      '& .MuiListItemText-primary': { color: 'rgba(255,255,255,0.8)' },
                      '& .MuiListItemText-secondary': { color: 'white', fontWeight: 'bold' }
                    }}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Endpoint"
                    secondary={peer.endpoint || 'No disponible'}
                    sx={{
                      '& .MuiListItemText-primary': { color: 'rgba(255,255,255,0.8)' },
                      '& .MuiListItemText-secondary': { color: 'white', fontWeight: 'bold' }
                    }}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Clave Pública"
                    secondary={peer.public_key ? `${peer.public_key.substring(0, 20)}...` : 'No disponible'}
                    sx={{
                      '& .MuiListItemText-primary': { color: 'rgba(255,255,255,0.8)' },
                      '& .MuiListItemText-secondary': { color: 'white', fontWeight: 'bold' }
                    }}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText
                    primary="Usuario Asociado"
                    secondary={peer.user_name || 'Sistema'}
                    sx={{
                      '& .MuiListItemText-primary': { color: 'rgba(255,255,255,0.8)' },
                      '& .MuiListItemText-secondary': { color: 'white', fontWeight: 'bold' }
                    }}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Estadísticas de tráfico */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                background: 'rgba(26,26,26,0.8)',
                border: '1px solid rgba(255, 69, 0, 0.3)',
                borderRadius: 2
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold'
                }}
              >
                Estadísticas de Tráfico
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <DataUsageCard
                    label="Total Enviado"
                    value={peer.transfer_tx || 0}
                    icon={Upload}
                    color="#22c55e"
                  />
                </Grid>
                <Grid item xs={6}>
                  <DataUsageCard
                    label="Total Recibido"
                    value={peer.transfer_rx || 0}
                    icon={Download}
                    color="#3b82f6"
                  />
                </Grid>
                <Grid item xs={6}>
                  <DataUsageCard
                    label="Conexiones"
                    value={peer.connection_count || 'N/A'}
                    icon={NetworkCheck}
                    color="#ff4500"
                  />
                </Grid>
                <Grid item xs={6}>
                  <DataUsageCard
                    label="Latencia"
                    value={peer.latency ? `${peer.latency}ms` : 'N/A'}
                    icon={Speed}
                    color="#8b5cf6"
                  />
                </Grid>
              </Grid>

              {peer.latest_handshake && (
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                    <strong>Último handshake:</strong>
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {new Date(peer.latest_handshake).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Gráfico de tráfico */}
          <Grid item xs={12}>
            <FireLineChart
              data={trafficData}
              title="Historial de Tráfico (Últimas 6 horas)"
              height={250}
              lines={[
                { key: 'upload', name: 'Subida (KB/s)' },
                { key: 'download', name: 'Bajada (KB/s)' }
              ]}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255, 69, 0, 0.3)' }}>
        <Button
          onClick={onClose}
          sx={{ color: 'rgba(255,255,255,0.7)' }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const PeerManagement = ({ peers, onRefresh, loading }) => {
  const [filteredPeers, setFilteredPeers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDevice, setFilterDevice] = useState('all');
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let filtered = peers;

    if (searchTerm) {
      filtered = filtered.filter(peer =>
        peer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        peer.ip_address.includes(searchTerm) ||
        (peer.user_name && peer.user_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus !== 'all') {
      if (filterStatus === 'connected') {
        filtered = filtered.filter(peer => {
          if (!peer.latest_handshake) return false;
          const timeDiff = new Date() - new Date(peer.latest_handshake);
          return timeDiff < 300000; // 5 minutos
        });
      } else if (filterStatus === 'disconnected') {
        filtered = filtered.filter(peer => {
          if (!peer.latest_handshake) return true;
          const timeDiff = new Date() - new Date(peer.latest_handshake);
          return timeDiff >= 300000;
        });
      } else {
        filtered = filtered.filter(peer => peer.status === filterStatus);
      }
    }

    if (filterDevice !== 'all') {
      filtered = filtered.filter(peer => peer.client_type === filterDevice);
    }

    setFilteredPeers(filtered);
  }, [peers, searchTerm, filterStatus, filterDevice]);

  const handleViewDetails = (peer) => {
    setSelectedPeer(peer);
    setDetailsOpen(true);
  };

  const handleToggleStatus = async (peerId, isActive) => {
    const newStatus = isActive ? 'active' : 'inactive';
    
    try {
      const response = await fetch(`/api/peers/${peerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setSuccess(`Estado del peer actualizado a ${newStatus}`);
        onRefresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Error actualizando estado del peer');
      }
    } catch (error) {
      setError('Error de conexión al actualizar estado');
    }
  };

  const handleDeletePeer = async (peerId, peerName) => {
    if (window.confirm(`¿Estás seguro de eliminar el peer "${peerName}"? Esta acción no se puede deshacer.`)) {
      try {
        const response = await fetch(`/api/peers/${peerId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setSuccess(`Peer "${peerName}" eliminado exitosamente`);
          onRefresh();
        } else {
          const data = await response.json();
          setError(data.error || 'Error eliminando peer');
        }
      } catch (error) {
        setError('Error de conexión al eliminar peer');
      }
    }
  };

  const getStats = () => {
    const connectedPeers = peers.filter(peer => {
      if (!peer.latest_handshake) return false;
      const timeDiff = new Date() - new Date(peer.latest_handshake);
      return timeDiff < 300000;
    });

    const totalTraffic = peers.reduce((sum, peer) => 
      sum + (peer.transfer_tx || 0) + (peer.transfer_rx || 0), 0
    );

    return {
      total: peers.length,
      connected: connectedPeers.length,
      disconnected: peers.length - connectedPeers.length,
      active: peers.filter(p => p.status === 'active').length,
      totalTraffic: totalTraffic
    };
  };

  const stats = getStats();

  return (
    <Box>
      {/* Alertas */}
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
                borderRadius: 2,
                border: '1px solid rgba(239, 68, 68, 0.3)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)'
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert
              severity="success"
              sx={{
                mb: 3,
                borderRadius: 2,
                border: '1px solid rgba(34, 197, 94, 0.3)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)'
              }}
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estadísticas rápidas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
              borderRadius: 2
            }}
          >
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              {stats.total}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Total Peers
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              borderRadius: 2
            }}
            className="animate-fire-pulse"
          >
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              {stats.connected}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Conectados
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              borderRadius: 2
            }}
          >
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              {stats.disconnected}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Desconectados
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: 2
            }}
          >
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              {(stats.totalTraffic / 1024 / 1024).toFixed(0)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              MB Tráfico
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Controles superiores */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="h5"
            sx={{
              background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}
          >
            Gestión de Peers VPN
          </Typography>
          
          <Tooltip title="Actualizar lista de peers">
            <IconButton
              onClick={onRefresh}
              sx={{
                color: '#ff4500',
                '&:hover': {
                  backgroundColor: 'rgba(255, 69, 0, 0.1)',
                  transform: 'rotate(180deg)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Filtros y búsqueda */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Buscar peers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  </InputAdornment>
                ),
                sx: {
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 69, 0, 0.3)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 69, 0, 0.6)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ff4500'
                  }
                }
              }}
              sx={{ backgroundColor: 'rgba(26,26,26,0.8)', borderRadius: 1 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Estado</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Estado"
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(26,26,26,0.8)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 69, 0, 0.3)'
                  }
                }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="connected">Conectados</MenuItem>
                <MenuItem value="disconnected">Desconectados</MenuItem>
                <MenuItem value="active">Activos</MenuItem>
                <MenuItem value="inactive">Inactivos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Dispositivo</InputLabel>
              <Select
                value={filterDevice}
                onChange={(e) => setFilterDevice(e.target.value)}
                label="Dispositivo"
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(26,26,26,0.8)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 69, 0, 0.3)'
                  }
                }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="mobile">Móvil</MenuItem>
                <MenuItem value="desktop">Desktop</MenuItem>
                <MenuItem value="tablet">Tablet</MenuItem>
                <MenuItem value="router">Router</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Vista de tarjetas de peers */}
      <Grid container spacing={3}>
        <AnimatePresence>
          {filteredPeers.map((peer) => (
            <Grid item xs={12} sm={6} md={4} key={peer.id}>
              <PeerCard
                peer={peer}
                onEdit={() => {}} // TODO: Implementar edición
                onDelete={handleDeletePeer}
                onToggleStatus={handleToggleStatus}
                onViewDetails={handleViewDetails}
              />
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      {filteredPeers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              background: 'rgba(26,26,26,0.8)',
              border: '1px solid rgba(255, 69, 0, 0.3)',
              borderRadius: 3
            }}
          >
            <VpnKey sx={{ fontSize: 64, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              No se encontraron peers
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              {searchTerm || filterStatus !== 'all' || filterDevice !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay peers configurados en el sistema'
              }
            </Typography>
          </Paper>
        </motion.div>
      )}

      {/* Dialog de detalles del peer */}
      <PeerDetailsDialog
        peer={selectedPeer}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </Box>
  );
};

export default PeerManagement;
