'use client';
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, Alert, Avatar, Tooltip, Badge, Grid, Card, CardContent,
  Tabs, Tab, InputAdornment, Switch, FormControlLabel, Divider
} from '@mui/material';
import {
  Add, Edit, Delete, Search, Visibility, VisibilityOff, People,
  AdminPanelSettings, Person, Block, CheckCircle, Warning, Error,
  VpnKey, History, Settings, Security, Email, Phone, LocationOn
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const StatusIndicator = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return { color: '#22c55e', icon: CheckCircle, label: 'Activo', glow: '0 0 10px rgba(34, 197, 94, 0.6)' };
      case 'inactive':
        return { color: '#6b7280', icon: Block, label: 'Inactivo', glow: '0 0 10px rgba(107, 114, 128, 0.6)' };
      case 'suspended':
        return { color: '#eab308', icon: Warning, label: 'Suspendido', glow: '0 0 10px rgba(234, 179, 8, 0.6)' };
      case 'banned':
        return { color: '#ef4444', icon: Error, label: 'Baneado', glow: '0 0 10px rgba(239, 68, 68, 0.6)' };
      default:
        return { color: '#6b7280', icon: Block, label: 'Desconocido', glow: '0 0 10px rgba(107, 114, 128, 0.6)' };
    }
  };

  const config = getStatusConfig(status);
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
        '& .MuiChip-icon': {
          color: config.color
        }
      }}
    />
  );
};

const RoleChip = ({ role }) => {
  const getRoleConfig = (role) => {
    switch (role) {
      case 'admin':
        return { color: '#ff4500', icon: AdminPanelSettings, label: 'Administrador', glow: '0 0 15px rgba(255, 69, 0, 0.6)' };
      case 'moderator':
        return { color: '#3b82f6', icon: Security, label: 'Moderador', glow: '0 0 15px rgba(59, 130, 246, 0.6)' };
      case 'user':
        return { color: '#22c55e', icon: Person, label: 'Usuario', glow: '0 0 15px rgba(34, 197, 94, 0.6)' };
      default:
        return { color: '#6b7280', icon: Person, label: 'Usuario', glow: '0 0 15px rgba(107, 114, 128, 0.6)' };
    }
  };

  const config = getRoleConfig(role);
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
        '& .MuiChip-icon': {
          color: config.color
        }
      }}
    />
  );
};

const UserCard = ({ user, onEdit, onDelete, onToggleStatus }) => {
  const isActive = user.status === 'active';
  
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
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  boxShadow: '0 0 20px rgba(255, 69, 0, 0.6)'
                }}
              >
                {user.username[0]?.toUpperCase()}
              </Avatar>
            </Badge>
            
            <Box sx={{ ml: 2, flex: 1 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                {user.username}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <RoleChip role={user.role} />
                <StatusIndicator status={user.status} />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2, borderColor: 'rgba(255, 69, 0, 0.2)' }} />

          <Box sx={{ mb: 2 }}>
            {user.email && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)', mr: 1 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  {user.email}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <History fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)', mr: 1 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Último login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Nunca'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VpnKey fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)', mr: 1 }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Creado: {new Date(user.created_at || Date.now()).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => onToggleStatus(user.id, e.target.checked)}
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
              <Tooltip title="Editar usuario">
                <IconButton
                  onClick={() => onEdit(user)}
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
              
              <Tooltip title="Eliminar usuario">
                <IconButton
                  onClick={() => onDelete(user.id, user.username)}
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

const UserManagement = ({ users, onRefresh, loading }) => {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active',
    password: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole, filterStatus]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      username: '',
      email: '',
      phone: '',
      role: 'user',
      status: 'active',
      password: '',
      location: '',
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email || '',
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      password: '',
      location: user.location || '',
      notes: user.notes || ''
    });
    setOpenDialog(true);
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario "${username}"? Esta acción no se puede deshacer.`)) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setSuccess(`Usuario "${username}" eliminado exitosamente`);
          onRefresh();
        } else {
          const data = await response.json();
          setError(data.error || 'Error eliminando usuario');
        }
      } catch (error) {
        setError('Error de conexión al eliminar usuario');
      }
    }
  };

  const handleToggleStatus = async (userId, isActive) => {
    const newStatus = isActive ? 'active' : 'inactive';
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setSuccess(`Estado del usuario actualizado a ${newStatus}`);
        onRefresh();
      } else {
        const data = await response.json();
        setError(data.error || 'Error actualizando estado del usuario');
      }
    } catch (error) {
      setError('Error de conexión al actualizar estado');
    }
  };

  const handleSaveUser = async () => {
    try {
      const url = selectedUser ? `/api/users/${selectedUser.id}` : '/api/users';
      const method = selectedUser ? 'PUT' : 'POST';

      const userData = { ...formData };
      if (!userData.password && selectedUser) {
        delete userData.password; // No actualizar password si está vacío en edición
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const result = await response.json();
        setOpenDialog(false);
        setSuccess(selectedUser ? 'Usuario actualizado exitosamente' : `Usuario creado exitosamente. ${result.data?.message || ''}`);
        onRefresh();
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Error guardando usuario');
      }
    } catch (error) {
      setError('Error de conexión al guardar usuario');
    }
  };

  const getStats = () => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
      admins: users.filter(u => u.role === 'admin').length,
      moderators: users.filter(u => u.role === 'moderator').length,
      regularUsers: users.filter(u => u.role === 'user').length
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
        <Grid item xs={6} sm={2}>
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
              Total
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={2}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              borderRadius: 2
            }}
          >
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              {stats.active}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Activos
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={2}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              borderRadius: 2
            }}
          >
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              {stats.inactive}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Inactivos
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={2}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              borderRadius: 2
            }}
          >
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              {stats.admins}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Admins
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={2}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: 2
            }}
          >
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              {stats.moderators}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Moderadores
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={2}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: 2
            }}
          >
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              {stats.regularUsers}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Usuarios
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
            Gestión de Usuarios
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddUser}
            className="btn-fire"
            sx={{
              background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
              }
            }}
          >
            Agregar Usuario
          </Button>
        </Box>

        {/* Filtros y búsqueda */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Buscar usuarios..."
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
          
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Rol</InputLabel>
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                label="Rol"
                sx={{
                  color: 'white',
                  backgroundColor: 'rgba(26,26,26,0.8)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 69, 0, 0.3)'
                  }
                }}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="moderator">Moderador</MenuItem>
                <MenuItem value="user">Usuario</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={2}>
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
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="inactive">Inactivo</MenuItem>
                <MenuItem value="suspended">Suspendido</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Tabs
              value={viewMode}
              onChange={(e, newValue) => setViewMode(newValue)}
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-selected': {
                    color: '#ff4500'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#ff4500'
                }
              }}
            >
              <Tab label="Tabla" value="table" />
              <Tab label="Tarjetas" value="cards" />
            </Tabs>
          </Grid>
        </Grid>
      </Box>

      {/* Vista de tabla */}
      {viewMode === 'table' && (
        <TableContainer component={Paper} className="fire-table" sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Último Login</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    component={TableRow}
                    hover
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)'
                          }}
                        >
                          {user.username[0]?.toUpperCase()}
                        </Avatar>
                        {user.username}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email || 'No especificado'}</TableCell>
                    <TableCell><RoleChip role={user.role} /></TableCell>
                    <TableCell><StatusIndicator status={user.status} /></TableCell>
                    <TableCell>
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Nunca'}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Editar">
                        <IconButton
                          onClick={() => handleEditUser(user)}
                          size="small"
                          sx={{ color: '#ff4500' }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          size="small"
                          sx={{ color: '#ef4444' }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Vista de tarjetas */}
      {viewMode === 'cards' && (
        <Grid container spacing={3}>
          <AnimatePresence>
            {filteredUsers.map((user) => (
              <Grid item xs={12} sm={6} md={4} key={user.id}>
                <UserCard
                  user={user}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  onToggleStatus={handleToggleStatus}
                />
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}

      {/* Dialog para agregar/editar usuarios */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(26,26,26,0.95) 0%, rgba(38,38,38,0.95) 100%)',
            border: '1px solid rgba(255, 69, 0, 0.3)',
            borderRadius: 3,
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255, 69, 0, 0.3)' }}>
          {selectedUser ? 'Editar Usuario' : 'Agregar Usuario'}
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                label="Nombre de Usuario"
                fullWidth
                variant="outlined"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 69, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 69, 0, 0.6)' },
                    '&.Mui-focused fieldset': { borderColor: '#ff4500' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 69, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 69, 0, 0.6)' },
                    '&.Mui-focused fieldset': { borderColor: '#ff4500' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Teléfono (Opcional)"
                fullWidth
                variant="outlined"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 69, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 69, 0, 0.6)' },
                    '&.Mui-focused fieldset': { borderColor: '#ff4500' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ubicación (Opcional)"
                fullWidth
                variant="outlined"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 69, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 69, 0, 0.6)' },
                    '&.Mui-focused fieldset': { borderColor: '#ff4500' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Rol</InputLabel>
                <Select
                  value={formData.role}
                  label="Rol"
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  sx={{
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
                  }}
                >
                  <MenuItem value="user">Usuario</MenuItem>
                  <MenuItem value="moderator">Moderador</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Estado</InputLabel>
                <Select
                  value={formData.status}
                  label="Estado"
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  sx={{
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
                  }}
                >
                  <MenuItem value="active">Activo</MenuItem>
                  <MenuItem value="inactive">Inactivo</MenuItem>
                  <MenuItem value="suspended">Suspendido</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label={selectedUser ? "Nueva Contraseña (dejar vacío para no cambiar)" : "Contraseña"}
                type={showPassword ? 'text' : 'password'}
                fullWidth
                variant="outlined"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 69, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 69, 0, 0.6)' },
                    '&.Mui-focused fieldset': { borderColor: '#ff4500' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notas (Opcional)"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 69, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 69, 0, 0.6)' },
                    '&.Mui-focused fieldset': { borderColor: '#ff4500' }
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255, 69, 0, 0.3)' }}>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            className="btn-fire"
            sx={{
              background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
              }
            }}
          >
            {selectedUser ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
