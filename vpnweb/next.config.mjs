/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    turbo: {}
  },
  // Configuración del servidor
  async rewrites() {
    return []
  },
  // Variables de entorno del servidor
  env: {
    CUSTOM_HOST: '10.66.66.1',
    CUSTOM_PORT: '8811'
  }
};

export default nextConfig;
