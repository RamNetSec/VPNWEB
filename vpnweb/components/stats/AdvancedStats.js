'use client';
import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Box, Grid, Chip, LinearProgress,
  Avatar, List, ListItem, ListItemText, ListItemAvatar,
  Card, CardContent, IconButton, Tooltip
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Speed, NetworkCheck,
  Security, DataUsage, Timeline, Refresh, Warning,
  CheckCircle, Error, Router, Hub, Cloud, Memory,
  Storage, Computer, Wifi, SignalCellularAlt, VpnKey
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FireAreaChart, FireBarChart, FireLineChart, FirePieChart,
  useRealtimeData
} from '../charts/FireChart';

const StatsCard = ({ title, value, subtitle, icon: Icon, color, trend, loading }) => {
  const trendColor = trend >= 0 ? '#22c55e' : '#ef4444';
  const TrendIcon = trend >= 0 ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <Card
        sx={{
          background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
          border: `1px solid ${color}44`,
          borderRadius: 4,
          overflow: 'visible',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            borderRadius: '16px 16px 0 0'
          }
        }}
        className="animate-fire-pulse"
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: `linear-gradient(135deg, ${color} 0%, ${color}aa 100%)`,
                boxShadow: `0 0 20px ${color}66`
              }}
              className="animate-ember-glow"
            >
              <Icon fontSize="large" />
            </Avatar>
            {trend !== undefined && (
              <Chip
                icon={<TrendIcon fontSize="small" />}
                label={`${Math.abs(trend).toFixed(1)}%`}
                size="small"
                sx={{
                  backgroundColor: `${trendColor}22`,
                  color: trendColor,
                  border: `1px solid ${trendColor}44`,
                  fontWeight: 'bold'
                }}
              />
            )}
          </Box>
          
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              background: `linear-gradient(135deg, #fff 0%, ${color} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            {loading ? '...' : value}
          </Typography>
          
          <Typography
            variant="h6"
            sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}
          >
            {title}
          </Typography>
          
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}
          >
            {subtitle}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const MetricBar = ({ label, value, maxValue, color, unit = '', animated = true }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ color: color, fontWeight: 'bold' }}>
          {value.toFixed(1)}{unit} / {maxValue}{unit}
        </Typography>
      </Box>
      
      <Box sx={{ position: 'relative', mb: 1 }}>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: 'rgba(255,255,255,0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              background: `linear-gradient(90deg, ${color} 0%, ${color}aa 50%, ${color} 100%)`,
              boxShadow: `0 0 10px ${color}66`,
              ...(animated && {
                backgroundSize: '200% 100%',
                animation: 'fireGlow 2s ease-in-out infinite alternate'
              })
            }
          }}
        />
        
        {percentage > 80 && (
          <Warning
            sx={{
              position: 'absolute',
              right: -30,
              top: -8,
              color: '#fbbf24',
              fontSize: 20,
              filter: 'drop-shadow(0 0 6px #fbbf24)'
            }}
          />
        )}
      </Box>
      
      <Typography
        variant="caption"
        sx={{ color: `rgba(255,255,255,0.6)` }}
      >
        {percentage.toFixed(1)}% utilizado
      </Typography>
    </Box>
  );
};

const NetworkTopologyNode = ({ node, index }) => {
  const getNodeColor = (type) => {
    switch (type) {
      case 'server': return '#ff4500';
      case 'client': return '#22c55e';
      case 'gateway': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <CheckCircle />;
      case 'offline': return <Error />;
      case 'warning': return <Warning />;
      default: return <Router />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
    >
      <Card
        sx={{
          background: 'rgba(26,26,26,0.9)',
          border: `2px solid ${getNodeColor(node.node_type)}44`,
          borderRadius: 3,
          backdropFilter: 'blur(16px)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            border: `2px solid ${getNodeColor(node.node_type)}`,
            boxShadow: `0 0 30px ${getNodeColor(node.node_type)}66`
          }
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                bgcolor: getNodeColor(node.node_type),
                boxShadow: `0 0 15px ${getNodeColor(node.node_type)}66`
              }}
            >
              {node.node_type === 'server' ? <Router /> : 
               node.node_type === 'gateway' ? <Hub /> : <Computer />}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                {node.node_id}
              </Typography>
              <Chip
                icon={getStatusIcon(node.status)}
                label={node.status}
                size="small"
                sx={{
                  backgroundColor: `${getNodeColor(node.node_type)}22`,
                  color: getNodeColor(node.node_type),
                  border: `1px solid ${getNodeColor(node.node_type)}44`,
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </Box>
          
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              <strong>IP:</strong> {node.ip_address}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              <strong>Ubicación:</strong> {node.location}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              <strong>Latencia:</strong> {node.latency}ms
            </Typography>
          </Box>
          
          <Typography
            variant="caption"
            sx={{ color: 'rgba(255,255,255,0.6)' }}
          >
            Última actividad: {new Date(node.last_seen).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AdvancedStats = ({ stats, onRefresh, loading }) => {
  console.log('🔍 AdvancedStats recibió stats:', stats);
  
  // Validar y sanitizar stats para prevenir errores
  const safeStats = stats || {};
  const safeOverview = safeStats.overview || {};
  const safeCharts = safeStats.charts || {};
  const safeRawData = safeStats.rawData || {};
  const safeSystemMetrics = safeRawData.systemMetrics || {};
  const safeTrafficStats = safeRawData.trafficStats || {};
  const safePeers = safeRawData.peers || [];

  // Datos del sistema desde la API real
  const systemResourcesData = [
    { 
      name: 'CPU', 
      value: safeSystemMetrics.cpu_usage || 0, 
      max: 100,
      color: '#ef4444'
    },
    { 
      name: 'RAM', 
      value: safeSystemMetrics.memory_usage || 0, 
      max: 100,
      color: '#3b82f6'
    },
    { 
      name: 'Disco', 
      value: safeSystemMetrics.disk_usage || 0, 
      max: 100,
      color: '#10b981'
    },
    { 
      name: 'Red', 
      value: safeSystemMetrics.network_usage || 0, 
      max: 100,
      color: '#f59e0b'
    }
  ];

  // Datos de usuarios desde peers
  const topUsersByTraffic = safePeers
    .map(peer => ({
      name: peer.name || 'Usuario Desconocido',
      upload: peer.transfer_tx || 0,
      download: peer.transfer_rx || 0,
      total: (peer.transfer_tx || 0) + (peer.transfer_rx || 0)
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Datos de red en tiempo real usando los charts de la API
  const networkTrafficData = safeCharts.systemMetrics?.network || [
    { time: '00:00', value: 25 },
    { time: '04:00', value: 30 },
    { time: '08:00', value: 45 },
    { time: '12:00', value: 65 },
    { time: '16:00', value: 55 },
    { time: '20:00', value: 40 }
  ];

  // Convertir a formato esperado por las gráficas
  const networkData = networkTrafficData.map(item => ({
    name: item.time,
    upload: Math.floor(item.value * 0.4),
    download: Math.floor(item.value * 0.6)
  }));

  // Datos de ancho de banda por usuario
  const bandwidthData = topUsersByTraffic.map(user => ({
    name: user.name,
    upload: Math.floor(user.upload / 1024 / 1024), // MB
    download: Math.floor(user.download / 1024 / 1024), // MB
    total: Math.floor(user.total / 1024 / 1024)
  }));

  // Estadísticas de conexiones
  const activeConnections = safeTrafficStats.peersActive || 0;
  const totalConnections = safeTrafficStats.peersTotal || 0;
  const bandwidth = safeTrafficStats.totalRx + safeTrafficStats.totalTx || 0;

  return (
    <Box>
      {/* Tarjetas de estadísticas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Conexiones Activas"
            value={activeConnections}
            subtitle="En tiempo real"
            icon={NetworkCheck}
            color="#22c55e"
            trend={2.5}
            loading={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Throughput"
            value={`${Math.floor(bandwidth / 1024 / 1024)} MB`}
            subtitle="Transferencia total"
            icon={Speed}
            color="#ff4500"
            trend={-1.2}
            loading={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Peers"
            value={totalConnections}
            subtitle="Registrados"
            icon={VpnKey}
            color="#3b82f6"
            trend={5.1}
            loading={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="CPU Sistema"
            value={`${Math.floor(safeSystemMetrics.cpu_usage || 0)}%`}
            subtitle="Uso actual"
            icon={Security}
            color="#8b5cf6"
            trend={1.8}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Gráficas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <FireLineChart
            data={networkData}
            title="Tráfico de Red en Tiempo Real"
            height={350}
            lines={[
              { key: 'upload', name: 'Subida (Mbps)' },
              { key: 'download', name: 'Bajada (Mbps)' }
            ]}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FirePieChart
            data={[
              { name: 'Activos', value: activeConnections, color: '#22c55e' },
              { name: 'Inactivos', value: totalConnections - activeConnections, color: '#ef4444' }
            ]}
            title="Estado de Peers"
            height={350}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper className="chart-container">
            <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold'
                }}
              >
                Recursos del Sistema
              </Typography>
              
              <Tooltip title="Actualizar métricas">
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
            
            {systemResourcesData.map((metric, index) => (
              <MetricBar
                key={index}
                label={metric.name}
                value={metric.value}
                maxValue={metric.max}
                color={metric.color}
                unit="%"
              />
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className="chart-container">
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold'
              }}
            >
              Top Usuarios por Tráfico
            </Typography>
            
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {topUsersByTraffic.length > 0 ? topUsersByTraffic.map((user, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ListItem
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      background: 'rgba(255,69,0,0.1)',
                      border: '1px solid rgba(255,69,0,0.2)',
                      '&:hover': {
                        background: 'rgba(255,69,0,0.2)',
                        transform: 'translateX(4px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          background: `linear-gradient(135deg, #ff4500, #ff6347)`,
                          width: 40,
                          height: 40
                        }}
                      >
                        <DataUsage />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body1"
                          sx={{ color: 'white', fontWeight: 600 }}
                        >
                          {user.name}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                          ↑ {Math.floor(user.upload / 1024 / 1024)} MB • ↓ {Math.floor(user.download / 1024 / 1024)} MB
                        </Typography>
                      }
                    />
                  </ListItem>
                </motion.div>
              )) : (
                <Typography
                  sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', py: 4 }}
                >
                  No hay datos de tráfico disponibles
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Sección de Análisis Avanzado */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper className="chart-container">
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold'
              }}
            >
              Uso de Ancho de Banda por Usuario (MB)
            </Typography>
            
            {bandwidthData.length > 0 ? (
              <FireBarChart
                data={bandwidthData}
                title="Consumo por Usuario"
                height={300}
                bars={[
                  { key: 'upload', name: 'Subida (MB)', color: '#ef4444' },
                  { key: 'download', name: 'Bajada (MB)', color: '#3b82f6' }
                ]}
              />
            ) : (
              <Typography
                sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  textAlign: 'center', 
                  py: 8 
                }}
              >
                Datos de ancho de banda en desarrollo
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className="chart-container">
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold'
              }}
            >
              Topología de Red
            </Typography>
            
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 300,
                background: 'rgba(255,69,0,0.05)',
                borderRadius: 2,
                border: '1px dashed rgba(255,69,0,0.3)'
              }}
            >
              <Hub sx={{ fontSize: 64, color: '#ff4500', mb: 2 }} />
              <Typography
                variant="h6"
                sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  textAlign: 'center',
                  mb: 1
                }}
              >
                Visualización avanzada de la red VPN
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255,255,255,0.5)' }}
              >
                {safePeers.length} peers detectados en la red
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Análisis Avanzado */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className="chart-container">
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold'
              }}
            >
              Análisis Avanzado
            </Typography>
            
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 200,
                background: 'rgba(255,69,0,0.05)',
                borderRadius: 2,
                border: '1px dashed rgba(255,69,0,0.3)'
              }}
            >
              <Timeline sx={{ fontSize: 48, color: '#ff4500', mb: 2 }} />
              <Typography
                variant="h6"
                sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  textAlign: 'center',
                  mb: 1
                }}
              >
                Herramientas de análisis y reportes detallados
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255,255,255,0.5)' }}
              >
                Próximamente: análisis predictivo y alertas inteligentes
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdvancedStats;
