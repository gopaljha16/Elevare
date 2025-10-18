/**
 * Sanitization utilities for user input
 */

/**
 * Sanitize text input by removing potentially harmful content
 * @param {string} input - Raw input text
 * @returns {string} - Sanitized text
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove potentially dangerous characters but keep resume-relevant ones
    .replace(/[<>]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Trim
    .trim();
};

/**
 * Sanitize email address
 * @param {string} email - Email address
 * @returns {string} - Sanitized email
 */
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') {
    return '';
  }
  
  return email.toLowerCase().trim();
};

/**
 * Sanitize phone number
 * @param {string} phone - Phone number
 * @returns {string} - Sanitized phone
 */
const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') {
    return '';
  }
  
  // Keep only digits, spaces, hyphens, parentheses, and plus sign
  return phone.replace(/[^0-9\s\-\(\)\+]/g, '').trim();
};

/**
 * Sanitize URL
 * @param {string} url - URL string
 * @returns {string} - Sanitized URL
 */
const sanitizeUrl = (url) => {
  if (typeof url !== 'string') {
    return '';
  }
  
  // Basic URL sanitization
  return url.trim().replace(/[<>"']/g, '');
};

module.exports = {
  sanitizeInput,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl
};