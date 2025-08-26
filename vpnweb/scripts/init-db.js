// Script para inicializar la base de datos con usuarios por defecto
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'vpn.db');

// Crear directorio si no existe
import { mkdirSync } from 'fs';
const dataDir = path.join(process.cwd(), 'data');
try {
  mkdirSync(dataDir, { recursive: true });
} catch (error) {
  // Directory already exists
}

const db = new Database(dbPath);

// Configurar SQLite
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000');

// Crear tablas
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    login_attempts INTEGER DEFAULT 0,
    locked_until DATETIME
  );

  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at DATETIME NOT NULL,
    data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

  CREATE TABLE IF NOT EXISTS security_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    details TEXT,
    severity TEXT DEFAULT 'info',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
  CREATE INDEX IF NOT EXISTS idx_security_logs_action ON security_logs(action);
`);

// Insertar usuario administrador por defecto
const adminPassword = 'admin123';
const hashedPassword = bcrypt.hashSync(adminPassword, 12);

const insertAdmin = db.prepare(`
  INSERT OR IGNORE INTO users (username, email, password_hash, role)
  VALUES (?, ?, ?, ?)
`);

insertAdmin.run('admin', 'admin@vpn.local', hashedPassword, 'admin');

// Insertar usuarios de ejemplo
const demoPassword = 'demo123';
const hashedDemoPassword = bcrypt.hashSync(demoPassword, 12);

insertAdmin.run('demo', 'demo@vpn.local', hashedDemoPassword, 'user');
insertAdmin.run('moderator', 'mod@vpn.local', hashedDemoPassword, 'moderator');

// Registrar inicialización en logs
const logInit = db.prepare(`
  INSERT INTO security_logs (action, details, severity)
  VALUES (?, ?, ?)
`);

logInit.run('database_init', 'Database initialized with default users', 'info');

console.log('✅ Database initialized successfully!');
console.log('📊 Default users created:');
console.log('   👤 Admin: admin / admin123');
console.log('   👤 Demo: demo / demo123'); 
console.log('   👤 Moderator: moderator / demo123');
console.log(`📁 Database location: ${dbPath}`);

db.close();
