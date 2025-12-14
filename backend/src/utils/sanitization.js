/**
 * Input Sanitization Utilities
 * Prevents XSS, injection attacks, and cleans user input
 * @version 1.0.0
 */

/**
 * Sanitize text input by removing potentially dangerous content
 * @param {string} input - Raw input string
 * @returns {string} Sanitized string
 */
function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Normalize whitespace (but preserve newlines for resume formatting)
  sanitized = sanitized.replace(/\r\n/g, '\n');
  sanitized = sanitized.replace(/\r/g, '\n');

  // Remove excessive whitespace
  sanitized = sanitized.replace(/[ \t]+/g, ' ');
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

  // Trim leading/trailing whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitize HTML content by escaping special characters
 * @param {string} input - Raw HTML string
 * @returns {string} Escaped string safe for display
 */
function escapeHtml(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  return input.replace(/[&<>"'`=/]/g, char => htmlEntities[char]);
}

/**
 * Sanitize filename to prevent path traversal
 * @param {string} filename - Original filename
 * @returns {string} Safe filename
 */
function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    return 'unnamed';
  }

  // Remove path separators and dangerous characters
  let safe = filename
    .replace(/[/\\]/g, '')
    .replace(/\.\./g, '')
    .replace(/[<>:"|?*\x00-\x1F]/g, '')
    .trim();

  // Limit length
  if (safe.length > 255) {
    const ext = safe.split('.').pop();
    const name = safe.substring(0, 250 - ext.length);
    safe = `${name}.${ext}`;
  }

  return safe || 'unnamed';
}

/**
 * Sanitize email address
 * @param {string} email - Raw email string
 * @returns {string} Sanitized email or empty string if invalid
 */
function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') {
    return '';
  }

  const sanitized = email.toLowerCase().trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return emailRegex.test(sanitized) ? sanitized : '';
}

/**
 * Sanitize URL
 * @param {string} url - Raw URL string
 * @returns {string} Sanitized URL or empty string if invalid
 */
function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const sanitized = url.trim();

  // Only allow http, https, and mailto protocols
  const allowedProtocols = ['http:', 'https:', 'mailto:'];
  
  try {
    const parsed = new URL(sanitized);
    if (allowedProtocols.includes(parsed.protocol)) {
      return sanitized;
    }
  } catch {
    // If URL parsing fails, check if it's a relative URL
    if (sanitized.startsWith('/') && !sanitized.startsWith('//')) {
      return sanitized;
    }
  }

  return '';
}

/**
 * Sanitize JSON input
 * @param {string} jsonString - Raw JSON string
 * @returns {Object|null} Parsed object or null if invalid
 */
function sanitizeJson(jsonString) {
  if (!jsonString || typeof jsonString !== 'string') {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonString);
    
    // Recursively sanitize string values
    const sanitizeObject = (obj) => {
      if (typeof obj === 'string') {
        return sanitizeInput(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      if (obj && typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[sanitizeInput(key)] = sanitizeObject(value);
        }
        return sanitized;
      }
      return obj;
    };

    return sanitizeObject(parsed);
  } catch {
    return null;
  }
}

/**
 * Check for potential prompt injection patterns
 * @param {string} input - Input to check
 * @returns {boolean} True if suspicious patterns detected
 */
function detectPromptInjection(input) {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const suspiciousPatterns = [
    /ignore\s+(previous|all|above)\s+instructions/i,
    /disregard\s+(previous|all|above)/i,
    /system\s*:\s*/i,
    /\[INST\]/i,
    /<\|im_start\|>/i,
    /<\|system\|>/i,
    /you\s+are\s+now/i,
    /pretend\s+you\s+are/i,
    /act\s+as\s+if/i,
    /forget\s+everything/i,
    /new\s+instructions/i,
    /override\s+instructions/i
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitize for MongoDB queries (prevent NoSQL injection)
 * @param {*} input - Input to sanitize
 * @returns {*} Sanitized input
 */
function sanitizeMongoQuery(input) {
  if (typeof input === 'string') {
    // Remove MongoDB operators
    return input.replace(/[$]/g, '');
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeMongoQuery);
  }
  
  if (input && typeof input === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      // Skip keys that start with $
      if (!key.startsWith('$')) {
        sanitized[key] = sanitizeMongoQuery(value);
      }
    }
    return sanitized;
  }
  
  return input;
}

/**
 * Truncate string to maximum length
 * @param {string} input - Input string
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add if truncated
 * @returns {string} Truncated string
 */
function truncate(input, maxLength = 1000, suffix = '...') {
  if (!input || typeof input !== 'string') {
    return '';
  }

  if (input.length <= maxLength) {
    return input;
  }

  return input.substring(0, maxLength - suffix.length) + suffix;
}

module.exports = {
  sanitizeInput,
  escapeHtml,
  sanitizeFilename,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeJson,
  detectPromptInjection,
  sanitizeMongoQuery,
  truncate
};
