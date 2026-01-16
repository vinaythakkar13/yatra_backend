/**
 * Request Logger Utility
 * Formats and logs incoming API requests with bodies
 */

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Foreground colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m'
};

/**
 * Log incoming request with formatted body
 * @param {Object} req - Express request object
 * @param {String} endpoint - API endpoint name/description
 */
const logRequestBody = (req, endpoint = '') => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.originalUrl || req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  // Determine method color
  let methodColor = colors.white;
  switch (method) {
    case 'POST':
      methodColor = colors.green;
      break;
    case 'PUT':
      methodColor = colors.yellow;
      break;
    case 'DELETE':
      methodColor = colors.red;
      break;
    case 'GET':
      methodColor = colors.blue;
      break;
    default:
      methodColor = colors.cyan;
  }

  // Create separator line
  const separator = colors.dim + '═'.repeat(80) + colors.reset;
  
  console.log('\n' + separator);
  console.log(
    colors.bright + colors.cyan + '📥 INCOMING REQUEST' + colors.reset +
    ' ' + colors.dim + `[${timestamp}]` + colors.reset
  );
  
  if (endpoint) {
    console.log(colors.bright + colors.magenta + '🎯 Endpoint: ' + colors.reset + endpoint);
  }
  
  console.log(
    methodColor + colors.bright + `${method}` + colors.reset + 
    ' ' + colors.white + path + colors.reset
  );
  
  console.log(colors.dim + '📍 IP: ' + colors.reset + ip);
  
  // Log headers (selected important ones)
  if (req.headers['content-type']) {
    console.log(colors.dim + '📋 Content-Type: ' + colors.reset + req.headers['content-type']);
  }
  
  if (req.headers['user-agent']) {
    const userAgent = req.headers['user-agent'].substring(0, 60) + '...';
    console.log(colors.dim + '🖥️  User-Agent: ' + colors.reset + userAgent);
  }
  
  // Log authentication status
  if (req.headers.authorization) {
    const authPreview = req.headers.authorization.substring(0, 20) + '...';
    console.log(colors.green + '🔐 Auth: ' + colors.reset + authPreview);
  } else {
    console.log(colors.yellow + '🔓 Auth: ' + colors.reset + 'None');
  }
  
  // Log request body
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('\n' + colors.bright + colors.yellow + '📦 REQUEST BODY:' + colors.reset);
    console.log(colors.dim + '─'.repeat(80) + colors.reset);
    
    // Create a sanitized copy of the body (hide sensitive data)
    const sanitizedBody = sanitizeBody(req.body);
    console.log(colors.cyan + JSON.stringify(sanitizedBody, null, 2) + colors.reset);
  } else {
    console.log('\n' + colors.dim + '📦 REQUEST BODY: (empty)' + colors.reset);
  }
  
  console.log(separator + '\n');
};

/**
 * Sanitize request body to hide sensitive information
 * @param {Object} body - Request body object
 * @returns {Object} Sanitized body
 */
const sanitizeBody = (body) => {
  const sensitiveFields = ['password', 'password_hash', 'token', 'secret', 'api_key', 'credit_card'];
  const sanitized = { ...body };
  
  for (const key in sanitized) {
    // Check if field name contains sensitive keywords
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
    
    if (isSensitive && sanitized[key]) {
      // Show only first 3 characters and length
      const value = String(sanitized[key]);
      const preview = value.length > 3 ? value.substring(0, 3) : value.substring(0, 1);
      sanitized[key] = `${preview}${'*'.repeat(Math.min(value.length - 3, 10))} [${value.length} chars]`;
    }
  }
  
  return sanitized;
};

/**
 * Log API response (optional, for debugging)
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Response message
 */
const logResponse = (statusCode, message = '') => {
  const timestamp = new Date().toISOString();
  
  // Determine status color
  let statusColor = colors.green;
  if (statusCode >= 400 && statusCode < 500) {
    statusColor = colors.yellow;
  } else if (statusCode >= 500) {
    statusColor = colors.red;
  }
  
  console.log(
    colors.dim + `[${timestamp}]` + colors.reset +
    ' ' + statusColor + colors.bright + `${statusCode}` + colors.reset +
    ' ' + (message ? colors.white + message + colors.reset : '')
  );
};

/**
 * Log validation errors in a formatted way
 * @param {Array} errors - Array of validation errors
 */
const logValidationErrors = (errors) => {
  console.log(colors.red + colors.bright + '\n❌ VALIDATION ERRORS:' + colors.reset);
  console.log(colors.dim + '─'.repeat(80) + colors.reset);
  
  errors.forEach((error, index) => {
    console.log(
      colors.red + `${index + 1}. ` + colors.reset +
      colors.yellow + `${error.param || error.field || 'unknown'}` + colors.reset +
      ': ' + colors.white + (error.msg || error.message) + colors.reset
    );
  });
  
  console.log(colors.dim + '─'.repeat(80) + colors.reset + '\n');
};

/**
 * Create a simple divider for readability
 */
const logDivider = () => {
  console.log(colors.dim + '─'.repeat(80) + colors.reset);
};

module.exports = {
  logRequestBody,
  logResponse,
  logValidationErrors,
  logDivider,
  colors
};

