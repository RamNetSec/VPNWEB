import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

async function getWireGuardManager() {
  const WireGuardManager = require('../../../lib/wireguard');
  return new WireGuardManager();
}

export async function GET() {
  let wgManager = null;
  
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    wgManager = await getWireGuardManager();
    const users = wgManager.getUsersFromDB();

    return NextResponse.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
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

export async function POST(request) {
  let wgManager = null;
  
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const data = await request.json();
    const { username, email, role = 'user', status = 'active' } = data;

    if (!username || username.length < 3) {
      return NextResponse.json({ error: 'El nombre de usuario debe tener al menos 3 caracteres' }, { status: 400 });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    wgManager = await getWireGuardManager();
    const db = wgManager.db;

    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return NextResponse.json({ error: 'El usuario ya existe' }, { status: 400 });
    }

    const bcrypt = require('bcryptjs');
    const defaultPassword = 'password123';
    const passwordHash = bcrypt.hashSync(defaultPassword, 12);

    const result = db.prepare(`
      INSERT INTO users (username, email, password_hash, role, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(username, email, passwordHash, role, status);

    return NextResponse.json({
      success: true,
      data: {
        id: result.lastInsertRowid,
        username,
        email,
        role,
        status,
        message: `Usuario creado. Contraseña temporal: ${defaultPassword}`
      }
    });

  } catch (error) {
    console.error('Error creando usuario:', error);
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
