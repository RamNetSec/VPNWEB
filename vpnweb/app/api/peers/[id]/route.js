import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

async function getWireGuardManager() {
  const WireGuardManager = require('../../../../lib/wireguard');
  return new WireGuardManager();
}

export async function GET(request, { params }) {
  let wgManager = null;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const { id } = params;

    wgManager = await getWireGuardManager();
    const db = wgManager.db;

    // Obtener peer con información del usuario
    const peer = db.prepare(`
      SELECT 
        p.*, u.username, u.email, u.status as user_status
      FROM peers p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(id);

    if (!peer) {
      return NextResponse.json({ error: 'Peer no encontrado' }, { status: 404 });
    }

    // Generar datos de tráfico histórico simulados
    const trafficHistory = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date();
      hour.setHours(hour.getHours() - i);
      
      trafficHistory.push({
        timestamp: hour.toISOString(),
        bytesReceived: Math.floor(Math.random() * 1000000) + (id * 1000),
        bytesSent: Math.floor(Math.random() * 500000) + (id * 500),
      });
    }

    // Calcular estadísticas adicionales
    const lastSeen = peer.last_handshake ? new Date(peer.last_handshake) : null;
    const isRecentlyActive = lastSeen && (Date.now() - lastSeen.getTime()) < (5 * 60 * 1000);

    const enrichedPeer = {
      ...peer,
      isRecentlyActive,
      bytesReceivedFormatted: formatBytes(peer.bytes_received || 0),
      bytesSentFormatted: formatBytes(peer.bytes_sent || 0),
      totalBytesFormatted: formatBytes((peer.bytes_received || 0) + (peer.bytes_sent || 0)),
      connectionStatus: peer.is_online ? 'online' : (isRecentlyActive ? 'recently_active' : 'offline'),
      lastSeenRelative: lastSeen ? getRelativeTime(lastSeen) : 'Never',
      trafficHistory
    };

    return NextResponse.json({
      success: true,
      data: enrichedPeer
    });

  } catch (error) {
    console.error('Error obteniendo peer:', error);
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

export async function PUT(request, { params }) {
  let wgManager = null;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const { id } = params;
    const data = await request.json();
    const { 
      name, 
      enabled, 
      allowed_ips, 
      endpoint, 
      persistent_keepalive,
      device_type,
      location
    } = data;

    wgManager = await getWireGuardManager();
    const db = wgManager.db;

    // Verificar que el peer existe
    const existingPeer = db.prepare('SELECT * FROM peers WHERE id = ?').get(id);
    if (!existingPeer) {
      return NextResponse.json({ error: 'Peer no encontrado' }, { status: 404 });
    }

    // Verificar que el nombre no esté en uso por otro peer
    if (name && name !== existingPeer.name) {
      const nameExists = db.prepare('SELECT id FROM peers WHERE name = ? AND id != ?').get(name, id);
      if (nameExists) {
        return NextResponse.json({ error: 'Ya existe un peer con ese nombre' }, { status: 400 });
      }
    }

    let updateFields = [];
    let updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (enabled !== undefined) {
      updateFields.push('enabled = ?');
      updateValues.push(enabled ? 1 : 0);
    }

    if (allowed_ips !== undefined) {
      updateFields.push('allowed_ips = ?');
      updateValues.push(allowed_ips);
    }

    if (endpoint !== undefined) {
      updateFields.push('endpoint = ?');
      updateValues.push(endpoint || null);
    }

    if (persistent_keepalive !== undefined) {
      updateFields.push('persistent_keepalive = ?');
      updateValues.push(persistent_keepalive);
    }

    if (device_type !== undefined) {
      updateFields.push('device_type = ?');
      updateValues.push(device_type);
    }

    if (location !== undefined) {
      updateFields.push('location = ?');
      updateValues.push(location || null);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No se proporcionaron campos para actualizar' }, { status: 400 });
    }

    // Agregar updated_at
    updateFields.push('updated_at = datetime("now")');
    updateValues.push(id); // Para el WHERE

    const updateQuery = `UPDATE peers SET ${updateFields.join(', ')} WHERE id = ?`;
    db.prepare(updateQuery).run(...updateValues);

    // Obtener el peer actualizado
    const updatedPeer = db.prepare(`
      SELECT 
        p.*, u.username, u.email, u.status as user_status
      FROM peers p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(id);

    return NextResponse.json({
      success: true,
      data: updatedPeer,
      message: 'Peer actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando peer:', error);
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

export async function DELETE(request, { params }) {
  let wgManager = null;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const { id } = params;

    wgManager = await getWireGuardManager();
    const db = wgManager.db;

    // Verificar que el peer existe
    const peer = db.prepare('SELECT * FROM peers WHERE id = ?').get(id);
    if (!peer) {
      return NextResponse.json({ error: 'Peer no encontrado' }, { status: 404 });
    }

    // Eliminar el peer
    db.prepare('DELETE FROM peers WHERE id = ?').run(id);

    return NextResponse.json({
      success: true,
      message: `Peer ${peer.name} eliminado exitosamente`
    });

  } catch (error) {
    console.error('Error eliminando peer:', error);
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

// Endpoint para generar configuración WireGuard
export async function POST(request, { params }) {
  let wgManager = null;
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const { id } = params;
    const { action } = await request.json();

    wgManager = await getWireGuardManager();
    const db = wgManager.db;

    const peer = db.prepare('SELECT * FROM peers WHERE id = ?').get(id);
    if (!peer) {
      return NextResponse.json({ error: 'Peer no encontrado' }, { status: 404 });
    }

    if (action === 'generate_config') {
      // Generar configuración WireGuard
      const config = `[Interface]
PrivateKey = ${peer.private_key}
Address = ${peer.allowed_ips}
DNS = 8.8.8.8, 8.8.4.4

[Peer]
PublicKey = SERVER_PUBLIC_KEY_HERE
Endpoint = YOUR_SERVER_IP:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = ${peer.persistent_keepalive}`;

      return NextResponse.json({
        success: true,
        data: {
          config,
          filename: `${peer.name}-wireguard.conf`
        }
      });
    }

    if (action === 'toggle_status') {
      const newEnabled = !peer.enabled;
      
      db.prepare('UPDATE peers SET enabled = ?, updated_at = datetime("now") WHERE id = ?')
        .run(newEnabled ? 1 : 0, id);

      const updatedPeer = db.prepare('SELECT * FROM peers WHERE id = ?').get(id);

      return NextResponse.json({
        success: true,
        data: updatedPeer,
        message: `Peer ${newEnabled ? 'habilitado' : 'deshabilitado'} exitosamente`
      });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });

  } catch (error) {
    console.error('Error en acción del peer:', error);
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

// Funciones auxiliares
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  return `Hace ${diffDays}d`;
}
