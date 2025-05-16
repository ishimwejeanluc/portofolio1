/**
 * API Key Authentication Middleware
 * This middleware validates API keys for protected API routes
 */

// In a production environment, these would be stored securely
// and not hardcoded in the source code
const validApiKeys = {
  'portfolio-api-key-123': {
    name: 'Default API Key',
    permissions: ['read']
  },
  'portfolio-admin-key-456': {
    name: 'Admin API Key',
    permissions: ['read', 'write', 'delete']
  }
};

/**
 * Middleware to validate API keys
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @param {Function} next - Next middleware function
 */
const apiKeyAuth = (req, res, next) => {
  // Get API key from header
  const apiKey = req.headers['x-api-key'];
  
  // Check if API key exists
  if (!apiKey) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'API key is required' }));
  }
  
  // Validate API key
  const keyData = validApiKeys[apiKey];
  if (!keyData) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Invalid API key' }));
  }
  
  // Add API key data to request for later use
  req.apiKey = {
    key: apiKey,
    name: keyData.name,
    permissions: keyData.permissions
  };
  
  // Continue to next middleware
  next();
};

module.exports = apiKeyAuth;
