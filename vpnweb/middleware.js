import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Rate limiting simple en memoria (en producción usar Redis)
const rateLimitMap = new Map();

function rateLimit(ip, limit = 100, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const requests = rateLimitMap.get(ip);
  
  // Limpiar requests antiguos
  const validRequests = requests.filter(time => time > windowStart);
  rateLimitMap.set(ip, validRequests);

  if (validRequests.length >= limit) {
    return false;
  }

  validRequests.push(now);
  rateLimitMap.set(ip, validRequests);
  return true;
}

// Limpiar el mapa periódicamente
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  
  for (const [ip, requests] of rateLimitMap.entries()) {
    const validRequests = requests.filter(time => time > now - windowMs);
    if (validRequests.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, validRequests);
    }
  }
}, 5 * 60 * 1000); // Cada 5 minutos

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Obtener IP real
    const ip = req.headers.get('x-forwarded-for') ||
               req.headers.get('x-real-ip') ||
               req.ip ||
               'unknown';

    // Rate limiting global
    if (!rateLimit(ip, 200, 15 * 60 * 1000)) { // 200 requests por 15 minutos
      console.warn(`🚫 Rate limit exceeded for IP: ${ip}`);
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }

    // Cabeceras de seguridad
    const response = NextResponse.next();
    
    // Prevenir XSS
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // CSP header
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Necesario para Next.js dev
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
    
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Content-Security-Policy', csp);
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    // Verificar rutas protegidas
    if (pathname.startsWith('/dashboard')) {
      if (!token) {
        console.warn(`🚫 Unauthorized access attempt to ${pathname} from IP: ${ip}`);
        return NextResponse.redirect(new URL('/?error=unauthorized', req.url));
      }

      // Verificar rol de admin para dashboard
      if (token.role !== 'admin') {
        console.warn(`🚫 Access denied to ${pathname} for user ${token.name} (role: ${token.role}) from IP: ${ip}`);
        return NextResponse.redirect(new URL('/?error=insufficient_permissions', req.url));
      }
    }

    // Rate limiting más estricto para APIs críticas
    if (pathname.startsWith('/api/')) {
      if (!rateLimit(`api_${ip}`, 50, 15 * 60 * 1000)) { // 50 API calls por 15 minutos
        console.warn(`🚫 API rate limit exceeded for IP: ${ip}`);
        return new NextResponse(
          JSON.stringify({ error: 'API rate limit exceeded' }), 
          { 
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Logging de accesos sospechosos
    const suspiciousPatterns = [
      /\.\./,  // Path traversal
      /\/admin/i,  // Admin access attempts
      /script/i,   // XSS attempts
      /union.*select/i,  // SQL injection attempts
      /javascript:/i,    // JavaScript protocol
      /vbscript:/i,      // VBScript protocol
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(pathname))) {
      console.warn(`🚨 Suspicious access attempt: ${pathname} from IP: ${ip}, User-Agent: ${req.headers.get('user-agent')}`);
      
      // En producción, podrías bloquear la IP o registrar en sistema de seguridad
      if (process.env.NODE_ENV === 'production') {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Rutas públicas
        if (pathname === '/' || pathname.startsWith('/api/auth')) {
          return true;
        }

        // Rutas protegidas requieren token
        if (pathname.startsWith('/dashboard')) {
          return !!token && token.role === 'admin';
        }

        // APIs protegidas
        if (pathname.startsWith('/api/')) {
          // Algunas APIs pueden ser públicas, otras requieren auth
          const publicAPIs = ['/api/auth'];
          return publicAPIs.some(api => pathname.startsWith(api)) || !!token;
        }

        return true;
      }
    }
  }
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ]
};
