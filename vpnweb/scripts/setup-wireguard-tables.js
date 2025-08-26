const Database = require('better-sqlite3');
const path = require('path');

function setupWireguardTables() {
  const dbPath = path.join(__dirname, '..', 'vpn.db');
  const db = new Database(dbPath);

  try {
    // Tabla para peers de WireGuard
    db.exec(`
      CREATE TABLE IF NOT EXISTS wireguard_peers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        public_key TEXT UNIQUE NOT NULL,
        private_key TEXT NOT NULL,
        ip_address TEXT UNIQUE NOT NULL,
        allowed_ips TEXT DEFAULT '0.0.0.0/0',
        endpoint TEXT,
        port INTEGER DEFAULT 51820,
        persistent_keepalive INTEGER DEFAULT 25,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_handshake DATETIME,
        bytes_sent INTEGER DEFAULT 0,
        bytes_received INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );
    `);

    // Tabla para estadísticas del sistema
    db.exec(`
      CREATE TABLE IF NOT EXISTS system_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_name TEXT NOT NULL,
        metric_value REAL NOT NULL,
        metric_unit TEXT DEFAULT '',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        details JSON
      );
    `);

    // Tabla para topología de red
    db.exec(`
      CREATE TABLE IF NOT EXISTS network_topology (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        node_id TEXT UNIQUE NOT NULL,
        node_type TEXT CHECK (node_type IN ('server', 'peer', 'gateway')),
        ip_address TEXT NOT NULL,
        location TEXT,
        connected_nodes JSON,
        bandwidth_up INTEGER DEFAULT 0,
        bandwidth_down INTEGER DEFAULT 0,
        latency INTEGER DEFAULT 0,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'online' CHECK (status IN ('online', 'offline', 'warning'))
      );
    `);

    // Tabla para conexiones activas
    db.exec(`
      CREATE TABLE IF NOT EXISTS active_connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        peer_id INTEGER,
        server_ip TEXT,
        client_ip TEXT,
        connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        bytes_transferred INTEGER DEFAULT 0,
        status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'timeout')),
        FOREIGN KEY (peer_id) REFERENCES wireguard_peers (id)
      );
    `);

    // Índices para optimizar consultas
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_peers_status ON wireguard_peers(status);
      CREATE INDEX IF NOT EXISTS idx_peers_user ON wireguard_peers(user_id);
      CREATE INDEX IF NOT EXISTS idx_stats_timestamp ON system_stats(timestamp);
      CREATE INDEX IF NOT EXISTS idx_topology_status ON network_topology(status);
      CREATE INDEX IF NOT EXISTS idx_connections_status ON active_connections(status);
    `);

    // Insertar datos de ejemplo
    const insertPeer = db.prepare(`
      INSERT OR IGNORE INTO wireguard_peers 
      (name, public_key, private_key, ip_address, user_id, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertStat = db.prepare(`
      INSERT INTO system_stats (metric_name, metric_value, metric_unit) 
      VALUES (?, ?, ?)
    `);

    const insertTopology = db.prepare(`
      INSERT OR IGNORE INTO network_topology 
      (node_id, node_type, ip_address, location, status) 
      VALUES (?, ?, ?, ?, ?)
    `);

    // Peers de ejemplo
    insertPeer.run('Server-Main', 'mock_server_pubkey_123', 'mock_server_privkey_123', '10.0.0.1', null, 'active');
    insertPeer.run('Client-Admin', 'mock_admin_pubkey_456', 'mock_admin_privkey_456', '10.0.0.2', 1, 'active');
    insertPeer.run('Client-Demo', 'mock_demo_pubkey_789', 'mock_demo_privkey_789', '10.0.0.3', 2, 'active');
    insertPeer.run('Client-Mobile-1', 'mock_mobile_pubkey_101', 'mock_mobile_privkey_101', '10.0.0.4', 1, 'inactive');

    // Estadísticas de ejemplo
    insertStat.run('cpu_usage', Math.random() * 100, '%');
    insertStat.run('memory_usage', Math.random() * 100, '%');
    insertStat.run('disk_usage', Math.random() * 100, '%');
    insertStat.run('network_throughput', Math.random() * 1000, 'Mbps');
    insertStat.run('active_connections', 15, 'connections');
    insertStat.run('total_peers', 4, 'peers');

    // Topología de ejemplo
    insertTopology.run('server-main', 'server', '10.0.0.1', 'Data Center - US East', 'online');
    insertTopology.run('gateway-eu', 'gateway', '10.0.0.10', 'Gateway - EU West', 'online');
    insertTopology.run('gateway-asia', 'gateway', '10.0.0.20', 'Gateway - Asia Pacific', 'warning');

    console.log('✅ Tablas de WireGuard creadas exitosamente');
    console.log('📊 Datos de ejemplo insertados');

  } catch (error) {
    console.error('❌ Error configurando tablas:', error);
  } finally {
    db.close();
  }
}

if (require.main === module) {
  setupWireguardTables();
}

module.exports = { setupWireguardTables };
