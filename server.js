const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const ejs = require('ejs');
const { createConnection } = require('./database/db');
const apiKeyAuth = require('./middleware/apiKeyAuth');
const basicAuth = require('./middleware/basicAuth');
require('dotenv').config();

// Configuration
const PORT = process.env.PORT || 3000;
const API_ENABLED = process.env.API_ENABLED === 'true' || true;
const ADMIN_ENABLED = process.env.ADMIN_ENABLED === 'true' || true;

// MIME types for serving static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

// Database connection
let db;
(async () => {
  try {
    db = await createConnection();
    console.log('Connected to MySQL database');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
})();



// Helper function to serve static files
const serveStaticFile = (res, filePath) => {
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'text/plain';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        res.writeHead(404);
        res.end('404 - File Not Found');
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
};

// Helper function to render EJS templates
const renderTemplate = async (res, templatePath, data = {}) => {
  try {
    const template = await fs.promises.readFile(templatePath, 'utf-8');
    const html = ejs.render(template, data, {
      filename: templatePath,
      views: [path.join(__dirname, 'views')]
    });
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } catch (error) {
    console.error('Error rendering template:', error);
    res.writeHead(500);
    res.end('Server Error');
  }
};

// Middleware handler
const applyMiddleware = (req, res, middlewares, callback) => {
  if (!middlewares || middlewares.length === 0) {
    return callback(req, res);
  }

  let index = 0;
  const next = () => {
    if (index >= middlewares.length) {
      return callback(req, res);
    }
    const middleware = middlewares[index++];
    middleware(req, res, next);
  };

  next();
};

// Route handlers
const routes = {
  '/': async (req, res) => {
    try {
      // Get profile data
      const [profileRows] = await db.query('SELECT * FROM profile LIMIT 1');
      const profile = profileRows[0];
      
      // Get skills
      const [skillsRows] = await db.query('SELECT * FROM skills ORDER BY proficiency DESC');
      
      // Get experience
      const [experienceRows] = await db.query('SELECT * FROM experience ORDER BY start_date DESC');
      
      // Get social links
      const [socialRows] = await db.query('SELECT * FROM social_links');
      
      // Render the home page with data
      await renderTemplate(res, path.join(__dirname, 'views', 'index.ejs'), {
        profile,
        skills: skillsRows,
        experience: experienceRows,
        socialLinks: socialRows
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.writeHead(500);
      res.end('Server Error');
    }
  },

  // API Routes with API Key Authentication
  '/api/profile': (req, res) => {
    if (!API_ENABLED) {
      res.writeHead(404);
      return res.end('Not Found');
    }

    applyMiddleware(req, res, [apiKeyAuth], async () => {
      try {
        const [rows] = await db.query('SELECT * FROM profile');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(rows));
      } catch (error) {
        console.error('API Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    });
  },

  '/api/skills': (req, res) => {
    if (!API_ENABLED) {
      res.writeHead(404);
      return res.end('Not Found');
    }

    applyMiddleware(req, res, [apiKeyAuth], async () => {
      try {
        const [rows] = await db.query('SELECT * FROM skills ORDER BY proficiency DESC');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(rows));
      } catch (error) {
        console.error('API Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    });
  },

  '/api/experience': (req, res) => {
    if (!API_ENABLED) {
      res.writeHead(404);
      return res.end('Not Found');
    }

    applyMiddleware(req, res, [apiKeyAuth], async () => {
      try {
        const [rows] = await db.query('SELECT * FROM experience ORDER BY start_date DESC');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(rows));
      } catch (error) {
        console.error('API Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    });
  },

  // Admin Routes with Basic Authentication
  '/admin': (req, res) => {
    if (!ADMIN_ENABLED) {
      res.writeHead(404);
      return res.end('Not Found');
    }

    applyMiddleware(req, res, [basicAuth], async () => {
      try {
        await renderTemplate(res, path.join(__dirname, 'views', 'admin.ejs'), {
          user: req.user,
          message: 'Welcome to the Admin Area'
        });
      } catch (error) {
        console.error('Admin Error:', error);
        res.writeHead(500);
        res.end('Server Error');
      }
    });
  }
};

// Create HTTP server
const server = http.createServer((req, res) => {
  // Parse URL
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;
  
  // Normalize pathname
  pathname = pathname.replace(/\/$/, '');
  if (pathname === '') pathname = '/';
  
  // Add query parameters and method to request object
  req.query = parsedUrl.query;
  req.method = req.method || 'GET';
  
  // Handle CORS for API requests
  if (pathname.startsWith('/api/')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }
  }
  
  // Check if the request is for a static file
  if (pathname.startsWith('/public/')) {
    const filePath = path.join(__dirname, pathname);
    return serveStaticFile(res, filePath);
  }
  
  // Handle image paths
  if (pathname.startsWith('/images/')) {
    const filePath = path.join(__dirname, 'public', pathname);
    return serveStaticFile(res, filePath);
  }
  
  // Check if the request is for a file in the root of public directory
  if (pathname.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|ttf|woff|woff2|eot|otf)$/)) {
    const filePath = path.join(__dirname, 'public', pathname);
    return serveStaticFile(res, filePath);
  }
  
  // Check if we have a route handler for this path
  if (routes[pathname]) {
    return routes[pathname](req, res);
  }
  
  // Check if this is an API path that doesn't exist
  if (pathname.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'API endpoint not found' }));
  }
  
  // 404 - Not Found
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>404 - Page Not Found</h1>');
});



// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close();
  if (db) db.end();
  process.exit(0);
});
