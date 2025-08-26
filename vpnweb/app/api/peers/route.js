import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

// Importar WireGuardManager usando require dinámico
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

    wgManager = await getWireGuardManager();
    
    // Obtener datos reales/simulados de WireGuard
    const wireGuardData = await wgManager.getWireGuardStatus();
    
    // Obtener usuarios para asociar con peers
    const users = wgManager.getUsersFromDB();
    const userMap = users.reduce((map, user) => {
      map[user.id] = user;
      return map;
    }, {});

    // Procesar peers con información de usuario
    const peers = wireGuardData.map(peer => {
      const user = userMap[peer.user_id];
      return {
        id: peer.public_key, // Usar public_key como ID único
        name: peer.name,
        public_key: peer.public_key,
        ip_address: peer.ip_address,
        allowed_ips: '0.0.0.0/0',
        endpoint: peer.endpoint,
        port: 51820,
        status: peer.status,
        created_at: new Date().toISOString(),
        last_handshake: peer.latest_handshake,
        bytes_sent: peer.transfer_tx || 0,
        bytes_received: peer.transfer_rx || 0,
        total_bytes: (peer.transfer_tx || 0) + (peer.transfer_rx || 0),
        formatted_bytes_sent: wgManager.formatBytes(peer.transfer_tx || 0),
        formatted_bytes_received: wgManager.formatBytes(peer.transfer_rx || 0),
        last_seen: peer.latest_handshake || peer.created_at,
        user_name: user ? user.username : (peer.peer_type === 'server' ? 'Sistema' : 'Desconocido'),
        user_role: user ? user.role : 'system'
      };
    });

    // Estadísticas de peers
    const peerStats = peers.reduce((acc, peer) => {
      if (!acc[peer.status]) {
        acc[peer.status] = {
          count: 0,
          total_sent: 0,
          total_received: 0
        };
      }
      acc[peer.status].count++;
      acc[peer.status].total_sent += peer.bytes_sent;
      acc[peer.status].total_received += peer.bytes_received;
      return acc;
    }, {});

    const peerStatsArray = Object.entries(peerStats).map(([status, stats]) => ({
      status,
      count: stats.count,
      total_sent: stats.total_sent,
      total_received: stats.total_received
    }));

    return NextResponse.json({
      success: true,
      data: {
        peers,
        statistics: peerStatsArray
      }
    });

  } catch (error) {
    console.error('Error obteniendo peers:', error);
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
