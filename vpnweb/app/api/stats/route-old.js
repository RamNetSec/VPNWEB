import { getDatabase } from '../../../lib/database';
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
    const db = getDatabase();

    // Obtener métricas reales del sistema
    const systemMetrics = await wgManager.getSystemMetrics();
    
    // Obtener datos reales de usuarios
    const users = wgManager.getUsersFromDB();
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;

    // Obtener datos reales/simulados de WireGuard
    const wireGuardData = await wgManager.getWireGuardStatus();
    const totalPeers = wireGuardData.length;
    const activePeers = wireGuardData.filter(p => p.status === 'active').length;
    const inactivePeers = totalPeers - activePeers;

    // Conexiones activas (basado en handshakes recientes)
    const now = new Date();
    const activeConnections = wireGuardData.filter(p => {
      if (!p.latest_handshake) return false;
      const timeDiff = now - new Date(p.latest_handshake);
      return timeDiff < 300000; // 5 minutos
    }).length;

    // Distribución de usuarios por rol
    const usersByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    const userRoleArray = Object.entries(usersByRole).map(([role, count]) => ({ role, count }));

    // Peers por estado
    const peersByStatus = wireGuardData.reduce((acc, peer) => {
      acc[peer.status] = (acc[peer.status] || 0) + 1;
      return acc;
    }, {});
    const peerStatusArray = Object.entries(peersByStatus).map(([status, count]) => ({ status, count }));

    // Uso de ancho de banda real
    const bandwidthStats = wireGuardData
      .filter(p => p.peer_type === 'client')
      .map(p => ({
        name: p.name,
        ip_address: p.ip_address,
        bytes_sent: p.transfer_tx || 0,
        bytes_received: p.transfer_rx || 0,
        total_bytes: (p.transfer_tx || 0) + (p.transfer_rx || 0)
      }))
      .sort((a, b) => b.total_bytes - a.total_bytes)
      .slice(0, 10);

    // Topología de red real
    const networkTopology = await wgManager.getNetworkTopology();

    return NextResponse.json({
      success: true,
      data: {
        // Resumen ejecutivo
        summary: {
          total_users: totalUsers,
          active_users: activeUsers,
          total_peers: totalPeers,
          active_peers: activePeers,
          inactive_peers: inactivePeers,
          active_connections: activeConnections
        },

        // Distribuciones
        distributions: {
          users_by_role: userRoleArray,
          peers_by_status: peerStatusArray
        },

        // Estadísticas del sistema (reales)
        system_metrics: systemMetrics,

        // Datos de red
        network: {
          topology: networkTopology,
          bandwidth_usage: bandwidthStats
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
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
