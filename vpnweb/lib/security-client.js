// Cliente-side security utilities - versión ligera sin dependencias del servidor
export class SecurityUtils {
  // Sanitizar entrada HTML básico para cliente
  static sanitizeHTML(dirty) {
    if (typeof dirty !== 'string') return '';
    
    return dirty
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Sanitizar entrada de texto plano
  static sanitizeText(input) {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remover < y >
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/vbscript:/gi, '') // Remover vbscript:
      .replace(/data:/gi, '') // Remover data:
      .replace(/on\w+=/gi, '') // Remover event handlers
      .slice(0, 1000); // Limitar longitud
  }

  // Detectar patrones XSS
  static detectXSS(input) {
    if (typeof input !== 'string') return false;
    
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /onmouseover\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /<link/gi,
      /<meta/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  // Detectar SQL injection
  static detectSQLInjection(input) {
    if (typeof input !== 'string') return false;
    
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(\'|\"|;|--|\#|\*|\/\*|\*\/)/g,
      /(\b(OR|AND)\b\s*(\d+\s*=\s*\d+|\w+\s*=\s*\w+))/gi,
      /(1\s*=\s*1|1\s*=\s*'1'|admin\s*--)/gi
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // Validar email básico
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validar username básico
  static isValidUsername(username) {
    if (!username || typeof username !== 'string') return false;
    return /^[a-zA-Z0-9_-]{3,30}$/.test(username);
  }

  // Validar password básico
  static isValidPassword(password) {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 6 && password.length <= 128;
  }

  // Validar y sanitizar entrada
  static validateAndSanitizeInput(input, type = 'text') {
    if (!input || typeof input !== 'string') {
      return { valid: false, error: 'Entrada inválida', value: '' };
    }

    // Detectar ataques
    if (this.detectXSS(input)) {
      return { valid: false, error: 'Contenido XSS detectado', value: '' };
    }

    if (this.detectSQLInjection(input)) {
      return { valid: false, error: 'Patrón SQL Injection detectado', value: '' };
    }

    let sanitized = this.sanitizeText(input);

    // Validaciones específicas por tipo
    switch (type) {
      case 'email':
        if (!this.isValidEmail(sanitized)) {
          return { valid: false, error: 'Email inválido', value: '' };
        }
        break;
      case 'username':
        if (!this.isValidUsername(sanitized)) {
          return { valid: false, error: 'Username debe tener 3-30 caracteres alfanuméricos', value: '' };
        }
        break;
      case 'password':
        if (!this.isValidPassword(input)) { // No sanitizar password
          return { valid: false, error: 'Password debe tener 6-128 caracteres', value: '' };
        }
        return { valid: true, value: input }; // Retornar password original
    }

    return { valid: true, value: sanitized };
  }

  // Rate limiting helpers (solo para tracking local)
  static createRateLimit(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const attempts = new Map();

    return {
      check: (key) => {
        const now = Date.now();
        const userAttempts = attempts.get(key) || [];
        
        // Limpiar intentos antiguos
        const validAttempts = userAttempts.filter(time => now - time < windowMs);
        
        if (validAttempts.length >= maxAttempts) {
          return { allowed: false, remaining: 0, resetTime: Math.min(...validAttempts) + windowMs };
        }

        validAttempts.push(now);
        attempts.set(key, validAttempts);
        
        return { allowed: true, remaining: maxAttempts - validAttempts.length };
      },
      
      reset: (key) => {
        attempts.delete(key);
      }
    };
  }
}
