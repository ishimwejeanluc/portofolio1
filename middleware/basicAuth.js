/**
 * Basic Authentication Middleware
 * This middleware provides HTTP Basic Authentication for protected routes
 */

// In a production environment, these would be stored securely
// and passwords would be properly hashed
const users = {
  'admin': 'admin123',
  'user': 'user123'
};

/**
 * Decode Base64 string
 * @param {string} str - Base64 encoded string
 * @return {string} Decoded string
 */
const decodeBase64 = (str) => {
  return Buffer.from(str, 'base64').toString();
};

/**
 * Middleware to validate basic authentication
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @param {Function} next - Next middleware function
 */
const basicAuth = (req, res, next) => {
  // Check for authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.writeHead(401, { 
      'Content-Type': 'text/plain',
      'WWW-Authenticate': 'Basic realm="Portfolio Admin Area"'
    });
    return res.end('Authentication required');
  }
  
  // Extract credentials
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = decodeBase64(base64Credentials);
  const [username, password] = credentials.split(':');
  
  // Validate credentials
  if (!users[username] || users[username] !== password) {
    res.writeHead(401, { 
      'Content-Type': 'text/plain',
      'WWW-Authenticate': 'Basic realm="Portfolio Admin Area"'
    });
    return res.end('Invalid credentials');
  }
  
  // Add user info to request for later use
  req.user = { username };
  
  // Continue to next middleware
  next();
};

module.exports = basicAuth;
