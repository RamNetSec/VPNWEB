import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import path from 'path';

let db = null;

function getDatabase() {
  if (!db) {
    const dbPath = process.env.NODE_ENV === 'production' 
      ? '/data/vpn.db' 
      : path.join(process.cwd(), 'vpn.db');
    
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('synchronous = NORMAL');
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  // Usuarios tabla con campos de seguridad mejorados
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      failed_login_attempts INTEGER DEFAULT 0,
      locked_until DATETIME,
      password_changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      two_factor_enabled BOOLEAN DEFAULT FALSE,
      two_factor_secret TEXT
    )
  `);

  // Sesiones tabla para manejo seguro de sesiones
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Logs de seguridad
  db.exec(`
    CREATE TABLE IF NOT EXISTS security_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      details TEXT,
      severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Configuración de VPN
  db.exec(`
    CREATE TABLE IF NOT EXISTS vpn_configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      config_name TEXT NOT NULL,
      public_key TEXT NOT NULL,
      private_key TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      port INTEGER DEFAULT 51820,
      status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'expired')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      last_used DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Índices para mejorar rendimiento
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_vpn_configs_user_id ON vpn_configs(user_id);
  `);

  // Crear usuario admin por defecto si no existe
  const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!adminExists) {
    createDefaultAdmin();
  }
}

function createDefaultAdmin() {
  const passwordHash = bcrypt.hashSync('root', 12);
  const insertUser = db.prepare(`
    INSERT INTO users (username, email, password_hash, role, status)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  try {
    insertUser.run('admin', 'admin@localhost', passwordHash, 'admin', 'active');
    console.log('✅ Default admin user created');
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
}

// Funciones de seguridad mejoradas
export const SecurityQueries = {
  // Validar usuario con protección contra timing attacks
  async validateUser(username, password) {
    const user = db.prepare(`
      SELECT id, username, password_hash, role, status, failed_login_attempts, locked_until
      FROM users 
      WHERE username = ? AND status = 'active'
    `).get(username);

    // Siempre ejecutar bcrypt para evitar timing attacks
    const dummyHash = '$2a$12$dummy.hash.to.prevent.timing.attacks';
    const providedHash = user ? user.password_hash : dummyHash;
    const isValid = await bcrypt.compare(password, providedHash);

    if (!user || !isValid) {
      if (user) {
        // Incrementar intentos fallidos
        db.prepare(`
          UPDATE users 
          SET failed_login_attempts = failed_login_attempts + 1,
              locked_until = CASE 
                WHEN failed_login_attempts >= 4 THEN datetime('now', '+1 hour')
                ELSE locked_until
              END
          WHERE id = ?
        `).run(user.id);
      }
      return null;
    }

    // Verificar si la cuenta está bloqueada
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return { error: 'account_locked', lockedUntil: user.locked_until };
    }

    // Reset intentos fallidos en login exitoso
    db.prepare(`
      UPDATE users 
      SET failed_login_attempts = 0, 
          locked_until = NULL,
          last_login = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(user.id);

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status
    };
  },

  // Crear sesión segura
  createSession(userId, ipAddress, userAgent) {
    const sessionId = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    db.prepare(`
      INSERT INTO sessions (id, user_id, expires_at, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `).run(sessionId, userId, expiresAt.toISOString(), ipAddress, userAgent);

    return { sessionId, expiresAt };
  },

  // Validar sesión
  validateSession(sessionId) {
    const session = db.prepare(`
      SELECT s.user_id, s.expires_at, u.username, u.role, u.status
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP AND u.status = 'active'
    `).get(sessionId);

    return session || null;
  },

  // Eliminar sesión
  deleteSession(sessionId) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
  },

  // Limpiar sesiones expiradas
  cleanExpiredSessions() {
    const result = db.prepare('DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP').run();
    return result.changes;
  },

  // Registrar evento de seguridad
  logSecurityEvent(userId, action, ipAddress, userAgent, details, severity = 'info') {
    db.prepare(`
      INSERT INTO security_logs (user_id, action, ip_address, user_agent, details, severity)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, action, ipAddress, userAgent, JSON.stringify(details), severity);
  }
};

// Funciones de gestión de usuarios con validación mejorada
export const UserQueries = {
  // Crear usuario con validación
  async createUser(username, email, password, role = 'user') {
    // Validaciones
    if (!username || username.length < 3 || username.length > 50) {
      throw new Error('Username debe tener entre 3 y 50 caracteres');
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Email inválido');
    }
    
    if (!password || password.length < 8) {
      throw new Error('Password debe tener al menos 8 caracteres');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    
    try {
      const result = db.prepare(`
        INSERT INTO users (username, email, password_hash, role, status)
        VALUES (?, ?, ?, ?, 'active')
      `).run(username, email, passwordHash, role);
      
      return result.lastInsertRowid;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Username o email ya existe');
      }
      throw error;
    }
  },

  // Obtener todos los usuarios (sin datos sensibles)
  getAllUsers() {
    return db.prepare(`
      SELECT id, username, email, role, status, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `).all();
  },

  // Actualizar usuario
  updateUser(id, updates) {
    const allowedFields = ['email', 'role', 'status'];
    const setClause = [];
    const values = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (setClause.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    values.push(id);
    
    const result = db.prepare(`
      UPDATE users 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(...values);

    return result.changes > 0;
  },

  // Eliminar usuario
  deleteUser(id) {
    // No permitir eliminar el último admin
    const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND status = 'active'").get();
    const userToDelete = db.prepare("SELECT role FROM users WHERE id = ?").get(id);
    
    if (userToDelete?.role === 'admin' && adminCount.count <= 1) {
      throw new Error('No se puede eliminar el último administrador');
    }

    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  }
};

// Inicializar base de datos al importar
getDatabase();

export { getDatabase };
export default getDatabase;
