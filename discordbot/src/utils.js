/**
 * Utility Functions
 *
 * Discord signature verification, validation, logging, etc.
 */

import nacl from 'tweetnacl';
import { encode } from 'tweetnacl/util';

/**
 * Verify Discord interaction signature
 *
 * Discord signs all requests with Ed25519 signature.
 * We must verify this to ensure requests are actually from Discord.
 *
 * @param {string} body - Raw request body
 * @param {string} signature - X-Signature-Ed25519 header
 * @param {string} timestamp - X-Signature-Timestamp header
 * @param {string} publicKey - Discord bot public key
 * @returns {boolean} Whether signature is valid
 */
export function verifyDiscordSignature(body, signature, timestamp, publicKey) {
  try {
    // Discord signature is hex-encoded
    const signatureBytes = Buffer.from(signature, 'hex');

    // Construct message to verify (timestamp + body)
    const message = timestamp + body;

    // Verify the signature using the public key
    const isValid = nacl.sign.detached.verify(
      Buffer.from(message),
      signatureBytes,
      Buffer.from(publicKey, 'hex')
    );

    return isValid;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Validate command options
 */
export function validateOptions(options, required = [], optional = []) {
  const provided = Object.keys(options);

  // Check required options
  for (const req of required) {
    if (!provided.includes(req)) {
      return {
        valid: false,
        error: `Missing required option: ${req}`
      };
    }
  }

  // Validate only known options
  const allowed = [...required, ...optional];
  for (const key of provided) {
    if (!allowed.includes(key)) {
      return {
        valid: false,
        error: `Unknown option: ${key}`
      };
    }
  }

  return { valid: true };
}

/**
 * Validate hex color format
 */
export function isValidHexColor(hex) {
  return /^#[0-9A-F]{6}$/i.test(hex);
}

/**
 * Sanitize user input
 */
export function sanitize(input) {
  if (typeof input !== 'string') return input;

  // Remove markdown formatting
  return input
    .replace(/[*_`~\\]/g, '')
    .substring(0, 256); // Discord field value limit
}

/**
 * Format number with commas
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Get current timestamp for logging
 */
export function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Log message with timestamp
 */
export function log(level, message, data = {}) {
  const timestamp = getTimestamp();
  const logMessage = `[${timestamp}] [${level}] ${message}`;

  if (level === 'error') {
    console.error(logMessage, data);
  } else if (level === 'warn') {
    console.warn(logMessage, data);
  } else {
    console.log(logMessage, data);
  }
}
