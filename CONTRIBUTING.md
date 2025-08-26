# 🤝 Guía de Contribución - VPNWEB

¡Gracias por tu interés en contribuir a VPNWEB! Esta guía te ayudará a participar efectivamente en el desarrollo del proyecto.

## 📋 Antes de Comenzar

### Requisitos Previos
- Node.js 18+ instalado
- Conocimiento básico de React y Next.js
- Familiaridad con Material-UI
- Comprensión básica de WireGuard (opcional)

### Configuración del Entorno
1. Fork el repositorio
2. Clona tu fork localmente
3. Instala las dependencias: `npm install`
4. Configura la base de datos: `npm run init-db`
5. Ejecuta el proyecto: `npm run dev`

## 🎯 Tipos de Contribuciones

### 🐛 Reportes de Bugs
Cuando reportes un bug, incluye:
- Descripción clara del problema
- Pasos para reproducir el error
- Comportamiento esperado vs actual
- Información del sistema (OS, Node.js version, etc.)
- Screenshots si aplica

### ✨ Nuevas Características
Para proponer nuevas funcionalidades:
1. Abre un issue describiendo la característica
2. Explica el problema que resuelve
3. Proporciona mockups o diagramas si es útil
4. Espera feedback antes de comenzar a codear

### 📚 Documentación
Contribuciones bienvenidas en:
- Mejoras al README
- Comentarios en el código
- Documentación de APIs
- Tutoriales y ejemplos

## 🔧 Proceso de Desarrollo

### 1. Configuración de Rama
```bash
git checkout main
git pull origin main
git checkout -b feature/nombre-descriptivo
```

### 2. Desarrollo
- Escribe código limpio y bien comentado
- Sigue las convenciones de estilo del proyecto
- Añade tests si es necesario
- Mantén commits pequeños y descriptivos

### 3. Testing
```bash
# Ejecutar linting
npm run lint

# Verificar que la aplicación funcione
npm run build
npm run start
```

### 4. Commit Messages
Usa mensajes de commit descriptivos:
```
feat: añade funcionalidad de exportación de usuarios
fix: corrige error de autenticación en /api/users
docs: actualiza README con nuevas instrucciones
style: mejora diseño del dashboard principal
refactor: optimiza consultas de base de datos
test: añade tests para API de peers
```

### 5. Pull Request
1. Push a tu fork
2. Crea un Pull Request a la rama `main`
3. Llena la plantilla de PR completamente
4. Responde a los comentarios de revisión

## 📝 Estándares de Código

### JavaScript/React
- Usa ES6+ sintaxis
- Componentes funcionales con hooks
- PropTypes para validación (cuando aplique)
- Manejo de errores apropiado

### Estilos
- Material-UI components preferidos
- Tema consistente con el diseño existente
- Responsive design
- Accesibilidad (a11y) considerada

### Base de Datos
- Migraciones para cambios de esquema
- Consultas optimizadas
- Validación de datos de entrada

## 🚨 Consideraciones de Seguridad

- **Nunca** hardcodees credenciales
- Valida todas las entradas de usuario
- Usa HTTPS en producción
- Sanitiza datos antes de mostrar
- Reporta vulnerabilidades responsablemente

## 🏗️ Estructura del Proyecto

```
vpnweb/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── dashboard/         # Dashboard principal
│   └── page.js            # Página de login
├── components/            # Componentes reutilizables
├── lib/                   # Lógica de negocio
├── data/                  # Base de datos
└── scripts/              # Scripts utilitarios
```

## 🔍 Revisión de Código

Los mantenedores revisarán:
- Calidad del código
- Adherencia a estándares
- Funcionalidad correcta
- Impacto en seguridad
- Compatibilidad con versiones existentes

## 📄 Licencia y Atribución

### Importante: Licencia Comercial
Este proyecto usa una **Licencia Comercial con Atribución Requerida**:

- ✅ Contribuciones son bienvenidas
- ⚠️ El código sigue bajo la licencia comercial
- 📜 La atribución a RamNetSec debe mantenerse
- 🤝 Los contribuyentes obtienen reconocimiento

### Tus Contribuciones
Al enviar un Pull Request, confirmas que:
- Tienes derecho a otorgar los derechos de tu contribución
- Tu código es original o tienes permisos para usarlo
- Aceptas que tu contribución se incluya bajo la licencia del proyecto

## 🎉 Reconocimiento

Los contribuyentes serán reconocidos en:
- CONTRIBUTORS.md (será creado)
- Release notes
- Documentación del proyecto

## 💬 Comunicación

### Canales
- **Issues**: Bugs y solicitudes de características
- **Discussions**: Preguntas generales y ideas
- **Pull Requests**: Revisiones de código

### Código de Conducta
- Sé respetuoso con otros contribuyentes
- Proporciona feedback constructivo
- Mantén discusiones técnicas y profesionales
- Ayuda a crear un ambiente inclusivo

## 🚀 Roadmap

### Próximas Características
- [ ] Multi-tenancy support
- [ ] API REST completa documentada
- [ ] Dashboard de métricas avanzado
- [ ] Integración con proveedores cloud
- [ ] Autenticación 2FA
- [ ] Backup automático de configuraciones

### ¿Cómo Ayudar?
1. Revisa los issues abiertos
2. Busca etiquetas `good first issue` para comenzar
3. Pregunta si necesitas clarificación
4. Propón mejoras basadas en tu experiencia

## 📞 Soporte

Si necesitas ayuda:
1. Revisa la documentación existente
2. Busca en issues cerrados
3. Crea un nuevo issue con detalles específicos
4. Participa en las discusiones del proyecto

---

<div align="center">
  <p><strong>¡Gracias por contribuir a VPNWEB! 🎉</strong></p>
  <p>Tu participación hace que este proyecto sea mejor para todos.</p>
</div>

## 📚 Recursos Adicionales

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [WireGuard Documentation](https://www.wireguard.com/quickstart/)
- [SQLite Documentation](https://sqlite.org/docs.html)

---

*Última actualización: 26 de Agosto, 2025*
