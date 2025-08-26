#!/bin/bash

# Script para iniciar el servidor VPN en la IP específica
export HOST=10.66.66.1
export PORT=8811
export NODE_ENV=production
export PATH=/root/.nvm/versions/node/v24.6.0/bin:$PATH

echo "🚀 Iniciando VPN Web Panel..."
echo "📍 Dirección: http://$HOST:$PORT"  
echo "🌐 Dominio: http://internal_vpn.ramnetsec.net:$PORT"
echo "⏰ Fecha: $(date)"
echo "📁 Directorio de trabajo: $(pwd)"

# Verificar que node está disponible
if ! command -v node &> /dev/null; then
    echo "❌ Error: node no encontrado"
    echo "PATH actual: $PATH"
    exit 1
fi

# Verificar que npm está disponible  
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm no encontrado"
    echo "PATH actual: $PATH"
    exit 1
fi

# Verificar que existe el archivo package.json
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json no encontrado en $(pwd)"
    exit 1
fi


# Iniciar el servidor
echo "▶️  Iniciando servidor..."
exec npm run start -- --hostname $HOST --port $PORT
