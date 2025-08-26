# 🔒 VPNWEB - WireGuard Admin Dashboard

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.5.0-black?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/WireGuard-Compatible-88171A?style=for-the-badge&logo=wireguard&logoColor=white" alt="WireGuard" />
  <img src="https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/License-Commercial-blue?style=for-the-badge" alt="License" />
</div>

## 📋 Descripción

**VPNWEB** es un panel de administración moderno y seguro para gestionar usuarios de WireGuard VPN. Desarrollado con Next.js 15, React 19 y Material-UI, ofrece una interfaz intuitiva para administradores que necesitan controlar el acceso VPN de manera eficiente.

### ✨ Características Principales

- 🎨 **Interfaz Moderna**: Dashboard responsivo con Material-UI y animaciones fluidas
- 🔐 **Autenticación Segura**: Sistema de login con NextAuth.js y validación robusta
- 👥 **Gestión de Usuarios**: CRUD completo para usuarios VPN con roles y estados
- 📊 **Estadísticas en Tiempo Real**: Monitoreo del estado de WireGuard y conexiones
- 🌐 **API RESTful**: Endpoints seguros para integración con otros sistemas
- 🗃️ **Base de Datos SQLite**: Almacenamiento local eficiente y confiable
- 🚀 **Optimizado**: Construcción con Turbopack para desarrollo y producción
- 📱 **Responsive**: Compatible con dispositivos móviles y escritorio

## 🚀 Inicio Rápido

El código fuente principal se encuentra en el directorio `vpnweb/`. 

👉 **Consulta `vpnweb/README.md` para instrucciones detalladas de instalación y configuración.**

## 📁 Estructura del Proyecto

```
VPNWEB/
├── README.md           # Este archivo
├── LICENSE            # Licencia comercial con atribución
└── vpnweb/           # Aplicación Next.js principal
    ├── app/          # App Router de Next.js 15
    ├── components/   # Componentes reutilizables
    ├── lib/          # Utilidades y lógica de negocio
    ├── data/         # Base de datos SQLite
    └── scripts/      # Scripts de configuración
```

## 🛡️ Seguridad

Este proyecto implementa múltiples capas de seguridad:

- Validación de entrada con express-validator
- Sanitización HTML con DOMPurify
- Rate limiting para prevenir ataques
- Helmet.js para headers de seguridad
- Autenticación basada en JWT con NextAuth.js

## 📄 Licencia

Este software está bajo una **Licencia Comercial con Atribución Requerida**. 

- ✅ **Permitido**: Uso comercial, modificación, distribución
- ⚠️ **Requerido**: Dar crédito apropiado al autor original
- 📜 Ver el archivo `LICENSE` para términos completos

## 👨‍💻 Créditos

Desarrollado por **RamNetSec** - Panel de administración VPN profesional.

---

<div align="center">
  <p>⭐ Si este proyecto te es útil, ¡no olvides dar una estrella!</p>
  <p>🔗 <a href="#-vpnweb---wireguard-admin-dashboard">Volver arriba</a></p>
</div>
