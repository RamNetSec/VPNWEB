#!/bin/bash

# Script para configurar la interfaz de red VPN
# Ejecutar como root

echo "🌐 Configurando interfaz de red para VPN Panel..."

# Verificar si la interfaz ya está configurada
if ip addr show | grep -q "10.66.66.1/24"; then
    echo "✅ La IP 10.66.66.1/24 ya está configurada"
else
    echo "📡 Configurando IP 10.66.66.1/24 en la interfaz de loopback"
    
    # Agregar la IP a la interfaz de loopback
    sudo ip addr add 10.66.66.1/24 dev lo label lo:vpn
    
    if [ $? -eq 0 ]; then
        echo "✅ IP configurada exitosamente"
    else
        echo "❌ Error configurando la IP"
        exit 1
    fi
fi

# Verificar conectividad
echo "🔍 Verificando configuración..."
ip addr show lo | grep "10.66.66.1"

echo "🎯 Configuración de red completa"
echo "   Panel disponible en: http://10.66.66.1:3000"
echo "   Dominio interno: http://internal_vpn.ramnetsec.net:3000"
