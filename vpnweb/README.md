# 🔒 VPNWEB - Panel de Administración WireGuard

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.5.0-black?style=flat-square&logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Material_UI-7.3.1-007FFF?style=flat-square&logo=mui" alt="MUI" />
  <img src="https://img.shields.io/badge/WireGuard-Compatible-88171A?style=flat-square&logo=wireguard" alt="WireGuard" />
</div>

## 📖 Descripción

Panel de administración web moderno para gestionar usuarios y configuraciones de WireGuard VPN. Construido con las últimas tecnologías web para ofrecer una experiencia de usuario excepcional y funcionalidad robusta.

## 🎯 Características

### 🔐 Autenticación y Seguridad
- **Login Seguro**: Autenticación con NextAuth.js
- **Validación de Entrada**: express-validator y sanitize-html
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **Headers de Seguridad**: Helmet.js para protección adicional
- **Sesiones JWT**: Manejo seguro de sesiones de usuario

### 👥 Gestión de Usuarios
- **CRUD Completo**: Crear, leer, actualizar y eliminar usuarios
- **Roles de Usuario**: Sistema de permisos granular
- **Estados de Usuario**: Activo, inactivo, suspendido
- **Búsqueda y Filtrado**: Localización rápida de usuarios
- **Exportación de Datos**: Configuraciones de WireGuard

### 📊 Dashboard y Monitoreo
- **Estadísticas en Tiempo Real**: Conexiones activas y tráfico
- **Estado de WireGuard**: Monitoreo del servicio VPN
- **Peers Conectados**: Lista de dispositivos conectados
- **Gráficos Interactivos**: Visualización de datos de uso
- **Alertas del Sistema**: Notificaciones importantes

### 🎨 Interfaz de Usuario
- **Material-UI**: Componentes modernos y accesibles
- **Tema Personalizable**: Dark/Light mode
- **Responsive**: Optimizado para móvil y escritorio
- **Animaciones Fluidas**: Framer Motion y animaciones CSS
- **Loading States**: Indicadores de progreso intuitivos

## 🚀 Instalación y Configuración

### 📋 Prerequisitos

Asegúrate de tener instalado:

- **Node.js** 18+ y npm
- **SQLite3** (incluido con better-sqlite3)
- **WireGuard** (opcional, funciona con datos simulados)
- **Linux/Unix** (recomendado para funcionalidad completa)

### ⚙️ Instalación

1. **Instala las dependencias:**

```bash
npm install
```

2. **Configura la base de datos:**

```bash
# Inicializar la base de datos SQLite
npm run init-db

# O ejecutar manualmente
node scripts/init-db.js
```

3. **Configura las variables de entorno:**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Configuración de NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-super-seguro-aqui

# Configuración de la aplicación
NODE_ENV=development
DATABASE_URL=./vpn.db

# Configuración de WireGuard (opcional)
WIREGUARD_CONFIG_PATH=/etc/wireguard
WIREGUARD_INTERFACE=wg0
```

## 🏃‍♂️ Ejecución

### 🔧 Modo Desarrollo

```bash
# Servidor de desarrollo con Turbopack
npm run dev

# Servidor de desarrollo estable
npm run dev:stable
```

La aplicación estará disponible en:
- **Local**: [http://localhost:3000](http://localhost:3000)
- **VPN**: [http://10.66.66.1:8811](http://10.66.66.1:8811)

### 🏭 Modo Producción

```bash
# Construir para producción
npm run build

# Iniciar servidor de producción
npm run start

# O usar el script completo
npm run prod
```

### 🔑 Credenciales de Acceso

**Credenciales por defecto:**
- 👤 **Admin**: `admin` / `admin123`
- 👤 **Demo**: `demo` / `demo123`

> ⚠️ **Importante**: Cambia estas credenciales en producción

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Usuarios
- `GET /api/users` - Listar todos los usuarios
- `POST /api/users` - Crear nuevo usuario
- `PUT /api/users/[id]` - Actualizar usuario
- `DELETE /api/users/[id]` - Eliminar usuario

### WireGuard
- `GET /api/wireguard/status` - Estado del servidor WireGuard
- `GET /api/peers` - Lista de peers conectados
- `GET /api/stats` - Estadísticas del sistema

## 🗃️ Base de Datos

El proyecto utiliza **SQLite** con la siguiente estructura:

### Tabla `users`
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla `peers` (WireGuard)
```sql
CREATE TABLE peers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  public_key TEXT UNIQUE NOT NULL,
  private_key TEXT NOT NULL,
  assigned_ip TEXT UNIQUE NOT NULL,
  last_handshake DATETIME,
  bytes_received INTEGER DEFAULT 0,
  bytes_sent INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1
);
```

## 📁 Estructura del Proyecto

```
vpnweb/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # NextAuth configuración
│   │   ├── users/         # Gestión de usuarios
│   │   ├── peers/         # Peers de WireGuard
│   │   ├── stats/         # Estadísticas del sistema
│   │   └── wireguard/     # Estado de WireGuard
│   ├── dashboard/         # Panel principal
│   ├── globals.css        # Estilos globales
│   ├── layout.js          # Layout principal
│   └── page.js            # Página de login
├── components/            # Componentes React reutilizables
│   ├── LoadingSpinner.js  # Spinner de carga
│   ├── NoSSR.js          # Wrapper para componentes client-only
│   ├── SessionWrapper.js  # Wrapper de NextAuth
│   └── ThemeProvider.js   # Proveedor de tema MUI
├── lib/                   # Utilidades y lógica de negocio
│   ├── database.js        # Conexión a SQLite
│   ├── security.js        # Funciones de seguridad
│   ├── userStore.js       # Store de usuarios
│   └── wireguard.js       # Manager de WireGuard
├── data/                  # Base de datos SQLite
│   └── vpn.db            # Base de datos principal
├── scripts/              # Scripts de configuración
│   ├── init-db.js        # Inicializar base de datos
│   └── setup-wireguard-tables.js
├── package.json          # Dependencias del proyecto
├── next.config.mjs       # Configuración de Next.js
├── middleware.js         # Middleware de Next.js
└── README.md            # Este archivo
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor desarrollo con Turbopack
npm run dev:stable       # Servidor desarrollo estable

# Producción
npm run build           # Construir para producción
npm run build:stable    # Construir sin Turbopack
npm run start           # Servidor de producción
npm run prod            # Script completo de producción

# Utilidades
npm run lint            # Ejecutar ESLint
npm run init-db         # Inicializar base de datos
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15**: Framework React con App Router
- **React 19**: Biblioteca de UI con hooks modernos
- **Material-UI 7**: Componentes de interfaz
- **Framer Motion**: Animaciones fluidas
- **Emotion**: CSS-in-JS para estilos

### Backend
- **Next.js API Routes**: Endpoints RESTful
- **NextAuth.js**: Autenticación y sesiones
- **better-sqlite3**: Base de datos SQLite
- **bcryptjs**: Hashing de contraseñas
- **Jose**: Manejo de JWT

### Seguridad
- **Helmet**: Headers de seguridad HTTP
- **express-rate-limit**: Limitación de peticiones
- **express-validator**: Validación de entrada
- **DOMPurify**: Sanitización HTML
- **sanitize-html**: Limpieza de contenido

## 🐛 Solución de Problemas

### Base de Datos no Inicializada
```bash
# Reinicializar la base de datos
rm -f vpn.db vpn.db-shm vpn.db-wal
node scripts/init-db.js
```

### Error de Permisos WireGuard
```bash
# Asegurar permisos correctos
sudo chmod 755 /etc/wireguard
sudo chown -R $USER:$USER ./vpn.db
```

### Puerto en Uso
```bash
# Encontrar proceso usando el puerto
lsof -ti:3000 | xargs kill -9

# O cambiar el puerto
npm run dev -- --port 3001
```

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la **Licencia Comercial con Atribución Requerida**.

- ✅ Uso comercial permitido
- ⚠️ Atribución requerida
- 📜 Ver `../LICENSE` para términos completos

## 🆘 Soporte

Si encuentras problemas o tienes preguntas:

1. Revisa la documentación y troubleshooting
2. Busca en issues existentes
3. Crea un nuevo issue con detalles del problema

---

<div align="center">
  <p><strong>Desarrollado con ❤️ por RamNetSec</strong></p>
  <p>🔐 Panel de administración VPN profesional y seguro</p>
</div>
