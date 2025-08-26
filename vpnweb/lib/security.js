// Server-side security utilities con validación completa
import validator from 'validator';

let purify = null;

// Inicializar DOMPurify solo en el servidor
const initializeDOMPurify = async () => {
  if (typeof window === 'undefined' && !purify) {
    try {
      const { JSDOM } = require('jsdom');
      const DOMPurifyModule = require('dompurify');
      const window = new JSDOM('').window;
      purify = DOMPurifyModule(window);
      
      purify.setConfig({
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        ALLOWED_ATTR: ['href', 'target'],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
        SANITIZE_DOM: true,
        SANITIZE_NAMED_PROPS: true,
        KEEP_CONTENT: false,
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
        FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover']
      });
    } catch (error) {
      console.warn('DOMPurify initialization failed:', error.message);
    }
  }
};

// Inicializar DOMPurify si estamos en el servidor
if (typeof window === 'undefined') {
  initializeDOMPurify();
}

export class SecurityUtils {
  // Sanitizar entrada HTML
  static sanitizeHTML(dirty) {
    if (typeof dirty !== 'string') return '';
    
    if (purify) {
      // Usar DOMPurify en servidor
      return purify.sanitize(dirty);
    } else {
      // Fallback para cliente o si DOMPurify no está disponible
      return dirty
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
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

  // Validar y sanitizar username
  static validateUsername(username) {
    if (!username || typeof username !== 'string') {
      return { valid: false, error: 'Username requerido' };
    }

    const sanitized = this.sanitizeText(username).toLowerCase();
    
    if (sanitized.length < 3) {
      return { valid: false, error: 'Username debe tener al menos 3 caracteres' };
    }
    
    if (sanitized.length > 50) {
      return { valid: false, error: 'Username no puede tener más de 50 caracteres' };
    }

    if (!/^[a-z0-9_-]+$/.test(sanitized)) {
      return { valid: false, error: 'Username solo puede contener letras, números, guiones y guiones bajos' };
    }

    // Lista de usernames reservados
    const reserved = ['admin', 'root', 'administrator', 'system', 'api', 'www', 'ftp', 'mail'];
    if (reserved.includes(sanitized) && sanitized !== 'admin') {
      return { valid: false, error: 'Username reservado' };
    }

    return { valid: true, value: sanitized };
  }

  // Validar email
  static validateEmail(email) {
    if (!email) {
      return { valid: true, value: null }; // Email es opcional
    }

    if (typeof email !== 'string') {
      return { valid: false, error: 'Email debe ser una cadena de texto' };
    }

    const sanitized = this.sanitizeText(email).toLowerCase();

    if (!validator.isEmail(sanitized)) {
      return { valid: false, error: 'Formato de email inválido' };
    }

    if (sanitized.length > 254) {
      return { valid: false, error: 'Email demasiado largo' };
    }

    return { valid: true, value: sanitized };
  }

  // Validar contraseña
  static validatePassword(password) {
    if (!password || typeof password !== 'string') {
      return { valid: false, error: 'Contraseña requerida' };
    }

    if (password.length < 8) {
      return { valid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
    }

    if (password.length > 128) {
      return { valid: false, error: 'La contraseña no puede tener más de 128 caracteres' };
    }

    // Verificar complejidad
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);

    const complexityCount = [hasLowerCase, hasUpperCase, hasNumbers, hasNonalphas].filter(Boolean).length;

    if (complexityCount < 3) {
      return { 
        valid: false, 
        error: 'La contraseña debe contener al menos 3 de: minúsculas, mayúsculas, números, símbolos' 
      };
    }

    // Verificar contraseñas comunes
    const commonPasswords = [
      'password', '123456', '12345678', 'admin', 'root',
      'qwerty', 'abc123', 'password123', 'admin123'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      return { valid: false, error: 'Contraseña demasiado común' };
    }

    return { valid: true, value: password };
  }

  // Validar rol
  static validateRole(role) {
    const validRoles = ['user', 'moderator', 'admin'];
    
    if (!role || !validRoles.includes(role)) {
      return { valid: false, error: 'Rol inválido' };
    }

    return { valid: true, value: role };
  }

  // Detectar posibles ataques SQL Injection
  static detectSQLInjection(input) {
    if (typeof input !== 'string') return false;

    const sqlPatterns = [
      /(\bUNION\b.*\bSELECT\b)|(\bSELECT\b.*\bFROM\b)|(\bINSERT\b.*\bINTO\b)|(\bUPDATE\b.*\bSET\b)|(\bDELETE\b.*\bFROM\b)/i,
      /(\bDROP\b.*\bTABLE\b)|(\bCREATE\b.*\bTABLE\b)|(\bALTER\b.*\bTABLE\b)/i,
      /(\bEXEC\b)|(\bEXECUTE\b)|(\bSP_\w+\b)/i,
      /(;.*--|\/\*.*\*\/|#.*)/,
      /('.*OR.*'|".*OR.*"|\bOR\b.*=.*)/i,
      /('.*AND.*'|".*AND.*"|\bAND\b.*=.*)/i
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // Detectar posibles ataques XSS
  static detectXSS(input) {
    if (typeof input !== 'string') return false;

    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]*src\s*=\s*["']javascript:/gi,
      /<svg[^>]*onload\s*=/gi,
      /expression\s*\(/gi,
      /eval\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  // Validar entrada general con detección de ataques
  static validateAndSanitizeInput(input, type = 'text') {
    if (input == null) return { valid: true, value: null };

    // Detectar ataques
    if (this.detectSQLInjection(input)) {
      console.warn('🚨 SQL Injection attempt detected:', input);
      return { valid: false, error: 'Entrada sospechosa detectada' };
    }

    if (this.detectXSS(input)) {
      console.warn('🚨 XSS attempt detected:', input);
      return { valid: false, error: 'Entrada sospechosa detectada' };
    }

    // Sanitizar según tipo
    switch (type) {
      case 'username':
        return this.validateUsername(input);
      case 'email':
        return this.validateEmail(input);
      case 'password':
        return this.validatePassword(input);
      case 'role':
        return this.validateRole(input);
      case 'html':
        return { valid: true, value: this.sanitizeHTML(input) };
      default:
        return { valid: true, value: this.sanitizeText(input) };
    }
  }

  // Generar token CSRF
  static generateCSRFToken() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  // Validar token CSRF
  static validateCSRFToken(token, sessionToken) {
    if (!token || !sessionToken) return false;
    return token === sessionToken;
  }

  // Rate limiting helper
  static createRateLimiter(maxRequests = 100, windowMs = 15 * 60 * 1000) {
    const requests = new Map();

    return {
      check: (key) => {
        const now = Date.now();
        const windowStart = now - windowMs;

        if (!requests.has(key)) {
          requests.set(key, []);
        }

        const userRequests = requests.get(key);
        const validRequests = userRequests.filter(time => time > windowStart);
        
        if (validRequests.length >= maxRequests) {
          return false;
        }

        validRequests.push(now);
        requests.set(key, validRequests);
        return true;
      },

      reset: (key) => {
        requests.delete(key);
      },

      cleanup: () => {
        const now = Date.now();
        for (const [key, userRequests] of requests.entries()) {
          const validRequests = userRequests.filter(time => time > now - windowMs);
          if (validRequests.length === 0) {
            requests.delete(key);
          } else {
            requests.set(key, validRequests);
          }
        }
      }
    };
  }

  // Generar hash seguro para archivos/datos
  static generateSecureHash(data) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Comparar hashes de forma segura (timing attack resistant)
  static secureCompare(a, b) {
    const crypto = require('crypto');
    return crypto.timingSafeEqual(
      Buffer.from(a, 'hex'),
      Buffer.from(b, 'hex')
    );
  }
}

export default SecurityUtils;
