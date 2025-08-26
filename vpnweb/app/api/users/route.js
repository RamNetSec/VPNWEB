import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import RealWireGuardManager from '../../../lib/wireguard-real';

export async function GET(request) {
  let wgManager = null;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';

    console.log('🔍 Obteniendo usuarios simulados...');
    
    // Crear usuarios simulados ya que no tenemos base de datos real
    const simulatedUsers = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@vpnweb.local',
        role: 'admin',
        status: 'active',
        phone: '+1234567890',
        location: 'Server Room',
        notes: 'Administrador principal del sistema',
        created_at: new Date(Date.now() - 86400000 * 30),
        updated_at: new Date(),
        last_login: new Date(Date.now() - 3600000)
      },
      {
        id: 2,
        username: 'user1',
        email: 'user1@vpnweb.local',
        role: 'user',
        status: 'active',
        phone: '+1234567891',
        location: 'Remote Office',
        notes: 'Usuario regular',
        created_at: new Date(Date.now() - 86400000 * 15),
        updated_at: new Date(),
        last_login: new Date(Date.now() - 7200000)
      },
      {
        id: 3,
        username: 'user2',
        email: 'user2@vpnweb.local',
        role: 'user',
        status: 'active',
        phone: '+1234567892',
        location: 'Home Office',
        notes: 'Trabajo remoto',
        created_at: new Date(Date.now() - 86400000 * 10),
        updated_at: new Date(),
        last_login: new Date(Date.now() - 10800000)
      },
      {
        id: 4,
        username: 'guest',
        email: 'guest@vpnweb.local',
        role: 'user',
        status: 'inactive',
        phone: null,
        location: 'Visitor',
        notes: 'Usuario invitado temporal',
        created_at: new Date(Date.now() - 86400000 * 5),
        updated_at: new Date(),
        last_login: new Date(Date.now() - 86400000 * 2)
      }
    ];

        // Aplicar filtros
    let filteredUsers = simulatedUsers;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    // Ordenar
    filteredUsers.sort((a, b) => {
      if (sortBy === 'created_at') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'username') {
        return a.username.localeCompare(b.username);
      } else if (sortBy === 'last_login') {
        return new Date(b.last_login || 0) - new Date(a.last_login || 0);
      }
      return 0;
    });

    // Aplicar paginación
    const total = filteredUsers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Enriquecer datos con información de peers
    const enrichedUsers = paginatedUsers.map(user => {
      // Simular peers asociados
      const peerCount = Math.floor(Math.random() * 3) + 1;
      const dataUsage = Math.floor(Math.random() * 1000000000); // Bytes aleatorios
      
      return {
        ...user,
        peer_count: peerCount,
        data_usage: dataUsage,
        formatted_data_usage: formatBytes(dataUsage),
        is_online: user.status === 'active' && Math.random() > 0.3
      };
    });

    console.log(`✅ ${enrichedUsers.length} usuarios simulados obtenidos`);

    return NextResponse.json({
      users: enrichedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: endIndex < total,
        hasPrev: page > 1
      },
      filters: {
        search,
        role,
        status,
        sortBy
      },
      metadata: {
        source: 'simulated',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message
      }, 
      { status: 500 }
    );
  } finally {
    if (wgManager) {
      wgManager.close();
    }
  }
}

// Función auxiliar para formatear bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function POST(request) {
  let wgManager = null;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const data = await request.json();
    const { 
      username, 
      email, 
      password, 
      role = 'user', 
      status = 'active',
      phone,
      location,
      notes
    } = data;

    // Validaciones
    if (!username || username.length < 3) {
      return NextResponse.json({ 
        error: 'El nombre de usuario debe tener al menos 3 caracteres' 
      }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      }, { status: 400 });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const validRoles = ['admin', 'user'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
    }

    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    wgManager = await getWireGuardManager();
    const db = wgManager.db;

    // Verificar si el usuario ya existe
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return NextResponse.json({ error: 'El usuario ya existe' }, { status: 400 });
    }

    // Verificar si el email ya existe (si se proporciona)
    if (email) {
      const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existingEmail) {
        return NextResponse.json({ error: 'El email ya está en uso' }, { status: 400 });
      }
    }

    // Hashear contraseña
    const bcrypt = require('bcryptjs');
    const passwordHash = bcrypt.hashSync(password, 12);

    // Crear usuario
    const result = db.prepare(`
      INSERT INTO users (
        username, email, password_hash, role, status, 
        phone, location, notes, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      username, 
      email || null, 
      passwordHash, 
      role, 
      status,
      phone || null,
      location || null,
      notes || null
    );

    // Obtener el usuario creado
    const newUser = db.prepare(`
      SELECT id, username, email, role, status, phone, location, notes, created_at, updated_at
      FROM users WHERE id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'Usuario creado exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creando usuario:', error);
    
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: 'El nombre de usuario o email ya está en uso' 
      }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  } finally {
    if (wgManager) {
      wgManager.close();
    }
  }
}
