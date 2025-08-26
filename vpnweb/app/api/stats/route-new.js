import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

async function getWireGuardManager() {
  const WireGuardManager = require('../../../lib/wireguard');
  return new WireGuardManager();
}

// Generar datos históricos simulados para las gráficas
function generateHistoricalData(days = 30) {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Simular patrones de uso realistas
    const dayOfWeek = date.getDay();
    const hour = date.getHours();
    
    // Más actividad en días laborables y horas pico
    let baseActivity = 100;
    if (dayOfWeek >= 1 && dayOfWeek <= 5) baseActivity *= 1.5; // Lunes a Viernes
    if (hour >= 9 && hour <= 17) baseActivity *= 1.3; // Horas de oficina
    if (hour >= 19 && hour <= 22) baseActivity *= 1.4; // Horas de noche
    
    const variance = 0.3;
    const randomFactor = 1 + (Math.random() - 0.5) * variance;
    
    data.push({
      date: date.toISOString().split('T')[0],
      timestamp: date.toISOString(),
      connections: Math.floor(baseActivity * randomFactor),
      bandwidth: Math.floor(baseActivity * randomFactor * 50), // MB
      users: Math.floor(baseActivity * randomFactor * 0.8),
      throughput: Math.floor(baseActivity * randomFactor * 25) // Mbps
    });
  }
  
  return data;
}

// Generar datos de tráfico por hora para las últimas 24 horas
function generateHourlyTraffic() {
  const data = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now);
    hour.setHours(hour.getHours() - i);
    
    // Patrones de tráfico más realistas por hora
    const hourOfDay = hour.getHours();
    let baseTraffic = 50;
    
    if (hourOfDay >= 8 && hourOfDay <= 10) baseTraffic *= 1.8; // Pico mañana
    if (hourOfDay >= 12 && hourOfDay <= 14) baseTraffic *= 1.5; // Almuerzo
    if (hourOfDay >= 18 && hourOfDay <= 22) baseTraffic *= 2.0; // Pico noche
    if (hourOfDay >= 0 && hourOfDay <= 6) baseTraffic *= 0.3; // Madrugada
    
    const variance = Math.random() * 0.4 + 0.8; // 0.8 - 1.2
    
    data.push({
      hour: hour.getHours(),
      timestamp: hour.toISOString(),
      upload: Math.floor(baseTraffic * variance),
      download: Math.floor(baseTraffic * variance * 3), // Download suele ser mayor
      total: Math.floor(baseTraffic * variance * 4)
    });
  }
  
  return data;
}

export async function GET(request) {
  let wgManager = null;
  
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h';
    const type = searchParams.get('type') || 'overview';

    wgManager = await getWireGuardManager();
    const db = wgManager.db;

    // Estadísticas básicas de la base de datos
    const userStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins
      FROM users
    `).get();

    const peerStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN enabled = 1 THEN 1 ELSE 0 END) as enabled,
        SUM(CASE WHEN is_online = 1 THEN 1 ELSE 0 END) as online,
        SUM(bytes_received) as totalBytesReceived,
        SUM(bytes_sent) as totalBytesSent
      FROM peers
    `).get();

    const deviceTypeStats = db.prepare(`
      SELECT 
        device_type, 
        COUNT(*) as count,
        SUM(bytes_received) as bytesReceived,
        SUM(bytes_sent) as bytesSent
      FROM peers 
      WHERE device_type IS NOT NULL AND device_type != ''
      GROUP BY device_type
      ORDER BY count DESC
    `).all();

    const recentActivity = db.prepare(`
      SELECT 
        p.name, p.device_type, p.last_handshake, p.bytes_received, p.bytes_sent,
        u.username
      FROM peers p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.last_handshake IS NOT NULL
      ORDER BY p.last_handshake DESC
      LIMIT 10
    `).all();

    // Datos simulados para gráficas
    const historicalData = generateHistoricalData(30);
    const hourlyTraffic = generateHourlyTraffic();

    // Calcular métricas derivadas
    const totalBandwidth = (peerStats.totalBytesReceived || 0) + (peerStats.totalBytesSent || 0);
    const avgBytesPerPeer = peerStats.total > 0 ? totalBandwidth / peerStats.total : 0;

    // Simular datos en tiempo real
    const currentTime = new Date();
    const realTimeStats = {
      timestamp: currentTime.toISOString(),
      activeConnections: peerStats.online,
      currentThroughput: Math.floor(Math.random() * 100 + 50), // Mbps
      cpuUsage: Math.floor(Math.random() * 30 + 20), // %
      memoryUsage: Math.floor(Math.random() * 40 + 30), // %
      networkLoad: Math.floor(Math.random() * 80 + 20), // %
    };

    // Preparar respuesta según el tipo solicitado
    let responseData = {
      success: true,
      timestamp: currentTime.toISOString(),
      period,
      overview: {
        users: {
          total: userStats.total,
          active: userStats.active,
          admins: userStats.admins,
          inactive: userStats.total - userStats.active
        },
        peers: {
          total: peerStats.total,
          online: peerStats.online,
          offline: peerStats.total - peerStats.online,
          enabled: peerStats.enabled,
          disabled: peerStats.total - peerStats.enabled
        },
        bandwidth: {
          totalReceived: peerStats.totalBytesReceived || 0,
          totalSent: peerStats.totalBytesSent || 0,
          total: totalBandwidth,
          averagePerPeer: avgBytesPerPeer,
          formattedTotal: formatBytes(totalBandwidth),
          formattedReceived: formatBytes(peerStats.totalBytesReceived || 0),
          formattedSent: formatBytes(peerStats.totalBytesSent || 0)
        },
        system: realTimeStats
      },
      charts: {
        historical: historicalData,
        hourlyTraffic: hourlyTraffic,
        deviceTypes: deviceTypeStats,
        trafficDistribution: [
          { name: 'Upload', value: peerStats.totalBytesSent || 0, color: '#ff6b35' },
          { name: 'Download', value: peerStats.totalBytesReceived || 0, color: '#f7931e' }
        ]
      },
      activity: {
        recent: recentActivity.map(activity => ({
          ...activity,
          formattedBytesReceived: formatBytes(activity.bytes_received || 0),
          formattedBytesSent: formatBytes(activity.bytes_sent || 0),
          lastSeenRelative: activity.last_handshake ? getRelativeTime(new Date(activity.last_handshake)) : 'Never'
        }))
      }
    };

    // Filtrar por tipo si se especifica
    if (type !== 'overview') {
      responseData = {
        success: true,
        timestamp: currentTime.toISOString(),
        type,
        data: responseData[type] || responseData.overview
      };
    }

    return NextResponse.json(responseData);

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
