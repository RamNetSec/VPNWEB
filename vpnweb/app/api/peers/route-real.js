import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import RealWireGuardManager from '../../../lib/wireguard-real';

export async function GET() {
  let wgManager = null;
  
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('🔍 Obteniendo peers desde WireGuard real...');
    
    // Usar el WireGuardManager real
    wgManager = new RealWireGuardManager();
    const peers = await wgManager.getWireGuardStatus();

    // Enriquecer datos de peers con información adicional
    const enrichedPeers = peers.map((peer, index) => ({
      id: index + 1,
      ...peer,
      // Campos adicionales para compatibilidad con el frontend
      user_id: index + 1,
      enabled: peer.status !== 'inactive',
      is_online: peer.status === 'active',
      bytes_received: peer.transfer_rx || 0,
      bytes_sent: peer.transfer_tx || 0,
      last_handshake: peer.latest_handshake,
      device_type: peer.peer_type || 'client',
      created_at: peer.created_at || new Date(),
      updated_at: new Date(),
      // Formatear bytes para mostrar
      formatted_rx: wgManager.formatBytes(peer.transfer_rx || 0),
      formatted_tx: wgManager.formatBytes(peer.transfer_tx || 0),
      // Información de conexión
      connection_info: {
        endpoint: peer.endpoint,
        allowed_ips: peer.allowed_ips,
        persistent_keepalive: peer.persistent_keepalive || 0,
        interface: peer.interface || 'wg0'
      }
    }));

    console.log(`✅ ${enrichedPeers.length} peers obtenidos desde WireGuard`);

    return NextResponse.json({
      success: true,
      count: enrichedPeers.length,
      peers: enrichedPeers,
      metadata: {
        source: 'wireguard_real',
        timestamp: new Date().toISOString(),
        active_peers: enrichedPeers.filter(p => p.status === 'active').length,
        idle_peers: enrichedPeers.filter(p => p.status === 'idle').length,
        inactive_peers: enrichedPeers.filter(p => p.status === 'inactive').length
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo peers:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message,
        source: 'wireguard_manager'
      }, 
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
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const data = await request.json();
    const { name, ip_address, device_type, enabled = true } = data;

    // Validar datos requeridos
    if (!name || !ip_address) {
      return NextResponse.json(
        { error: 'Nombre e IP son requeridos' },
        { status: 400 }
      );
    }

    // Simular creación de peer (en implementación real se configuraría WireGuard)
    const crypto = require('crypto');
    const newPeer = {
      id: Date.now(), // ID temporal
      name,
      ip_address,
      device_type: device_type || 'client',
      enabled: enabled,
      status: enabled ? 'active' : 'inactive',
      public_key: crypto.randomBytes(32).toString('base64'),
      interface: 'wg0',
      endpoint: null,
      allowed_ips: `${ip_address}/32`,
      latest_handshake: enabled ? new Date() : null,
      transfer_rx: 0,
      transfer_tx: 0,
      persistent_keepalive: 25,
      created_at: new Date(),
      updated_at: new Date()
    };

    console.log(`✅ Peer simulado creado: ${name} (${ip_address})`);

    return NextResponse.json({
      success: true,
      message: 'Peer creado exitosamente',
      peer: newPeer
    });

  } catch (error) {
    console.error('❌ Error creando peer:', error);
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
