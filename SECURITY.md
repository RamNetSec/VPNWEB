# 🔒 Política de Seguridad - VPNWEB

## 📊 Versiones Soportadas

Actualmente soportamos las siguientes versiones con actualizaciones de seguridad:

| Versión | Soporte de Seguridad |
| ------- | ------------------- |
| 0.1.x   | ✅ Sí               |
| < 0.1   | ❌ No               |

## 🚨 Reportando Vulnerabilidades de Seguridad

La seguridad es una prioridad máxima para VPNWEB. Si descubres una vulnerabilidad de seguridad, te pedimos que la reportes de manera responsable.

### 📧 Proceso de Reporte

1. **NO** abras un issue público para vulnerabilidades de seguridad
2. Envía un email detallado a: **security@ramnet.local** (o crea un issue privado)
3. Incluye los siguientes detalles:

```
Título: [SECURITY] Descripción breve de la vulnerabilidad

Detalles:
- Tipo de vulnerabilidad
- Componente afectado
- Pasos para reproducir
- Impacto potencial
- Versión afectada
- Información del entorno
```

### ⏱️ Tiempo de Respuesta

- **Reconocimiento inicial**: 24-48 horas
- **Evaluación preliminar**: 1-3 días hábiles  
- **Actualización de estado**: Cada 5-7 días
- **Resolución objetivo**: 30 días para vulnerabilidades críticas

### 🏆 Reconocimiento

Los investigadores de seguridad que reporten vulnerabilidades legítimas serán:
- Reconocidos públicamente (si lo desean)
- Incluidos en un Hall of Fame de seguridad
- Contactados para futuras mejoras de seguridad

## 🛡️ Medidas de Seguridad Implementadas

### Autenticación y Autorización
- ✅ NextAuth.js para manejo seguro de sesiones
- ✅ Hashing de contraseñas con bcryptjs
- ✅ JWT tokens con expiración
- ✅ Validación de roles y permisos

### Protección de Datos
- ✅ Sanitización de entradas con DOMPurify
- ✅ Validación de datos con express-validator
- ✅ Base de datos SQLite con transacciones seguras
- ✅ Encriptación de datos sensibles

### Protección de Red
- ✅ Rate limiting para prevenir ataques de fuerza bruta
- ✅ Helmet.js para headers de seguridad HTTP
- ✅ Middleware de seguridad personalizado
- ✅ Validación de CORS apropiada

### Seguridad del Cliente
- ✅ Content Security Policy (CSP)
- ✅ Sanitización de HTML antes del renderizado
- ✅ Protección contra XSS
- ✅ Prevención de CSRF

## 🔧 Configuración de Seguridad Recomendada

### Variables de Entorno
```env
# CRÍTICO: Usar secrets fuertes en producción
NEXTAUTH_SECRET=tu-secret-muy-seguro-y-aleatorio-de-32-caracteres-minimo
NEXTAUTH_URL=https://tu-dominio.com

# Base de datos
DATABASE_URL=ruta-segura-a-tu-base-de-datos

# JWT
JWT_SECRET=otro-secret-diferente-para-jwt-tokens
```

### Configuración del Servidor
```bash
# Permisos de archivos recomendados
chmod 600 .env.local
chmod 644 vpn.db
chown app:app vpn.db

# Configuración de firewall
ufw allow 3000/tcp  # Solo si es necesario
ufw enable
```

### Headers de Seguridad
```javascript
// Ya implementado en el proyecto
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
})
```

## ⚠️ Vulnerabilidades Conocidas y Mitigaciones

### Versión 0.1.0

| Componente | Riesgo | Estado | Mitigación |
|------------|--------|--------|------------|
| Demo Credentials | Bajo | ⚠️ Conocido | Cambiar en producción |
| SQLite File Access | Medio | ✅ Mitigado | Permisos de archivo |
| Rate Limiting | Bajo | ✅ Implementado | Express rate limit |

## 🎯 Mejores Prácticas para Desarrolladores

### Desarrollo Seguro
```javascript
// ✅ CORRECTO: Validar y sanitizar entradas
const { body, validationResult } = require('express-validator');

app.post('/api/users', [
  body('username').isLength({ min: 3 }).escape(),
  body('email').isEmail().normalizeEmail(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Procesar datos seguros...
});

// ❌ INCORRECTO: Usar datos sin validar
app.post('/api/users', (req, res) => {
  const user = req.body; // Peligroso!
  database.createUser(user);
});
```

### Manejo de Secretos
```javascript
// ✅ CORRECTO: Variables de entorno
const secret = process.env.NEXTAUTH_SECRET;

// ❌ INCORRECTO: Hardcoded secrets
const secret = "mi-secret-123"; // Nunca hacer esto
```

### Consultas de Base de Datos
```javascript
// ✅ CORRECTO: Prepared statements
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

// ❌ INCORRECTO: Concatenación de strings
const user = db.exec(`SELECT * FROM users WHERE id = ${userId}`); // SQL Injection!
```

## 📋 Checklist de Seguridad para Producción

### Pre-Deploy
- [ ] Variables de entorno con valores seguros
- [ ] Credenciales por defecto cambiadas
- [ ] HTTPS configurado y funcionando
- [ ] Rate limiting habilitado y configurado
- [ ] Logs de seguridad habilitados
- [ ] Base de datos con permisos restrictivos

### Post-Deploy
- [ ] Scan de vulnerabilidades ejecutado
- [ ] Penetration testing básico realizado
- [ ] Monitoreo de logs configurado
- [ ] Backup de configuraciones críticas
- [ ] Plan de respuesta a incidentes documentado

### Mantenimiento
- [ ] Actualizaciones de dependencias regulares
- [ ] Revisión de logs de seguridad semanal
- [ ] Rotación de secrets periódica
- [ ] Auditorías de seguridad trimestrales

## 🔍 Herramientas de Seguridad Recomendadas

### Análisis Estático
```bash
# npm audit para vulnerabilidades de dependencias
npm audit --audit-level high

# ESLint con reglas de seguridad
npx eslint --ext .js,.jsx . --fix
```

### Monitoreo
```bash
# Logs de sistema
tail -f /var/log/auth.log

# Monitoreo de procesos
ps aux | grep node

# Conexiones de red
netstat -tulpn | grep :3000
```

## 📞 Contacto de Seguridad

Para cualquier consulta relacionada con seguridad:

- **Email**: security@ramnet.local
- **GitHub**: Crear issue con etiqueta `security`
- **Urgente**: Contactar directamente a RamNetSec

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [SQLite Security](https://sqlite.org/security.html)

---

<div align="center">
  <p><strong>🛡️ La seguridad es responsabilidad de todos</strong></p>
  <p>Mantengamos VPNWEB seguro para toda la comunidad</p>
</div>

---

*Última actualización: 26 de Agosto, 2025*
*Versión de política: 1.0*
