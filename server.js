const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const ejs = require('ejs');
const { createConnection } = require('./database/db');
require('dotenv').config();

// Configuration
const PORT = process.env.PORT || 3000;
console.log(`Starting server on port ${PORT}`);

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

// Route handlers
const routes = {
  '/': async (req, res) => {
    try {
      console.log('Handling root route request');
      
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
      } catch (dbError) {
        console.error('Database error:', dbError);
        // If there's a database error, serve a static fallback page
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>ISHIMWE JEAN LUC - Portfolio</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
              .container { max-width: 800px; margin: 0 auto; }
              h1 { color: #2c3e50; }
              p { margin-bottom: 20px; }
              .contact { background: #f8f9fa; padding: 20px; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>ISHIMWE JEAN LUC</h1>
              <h2>Software Engineer</h2>
              <p>Welcome to my portfolio! The database is currently being initialized. Please check back in a few moments.</p>
              
              <div class="contact">
                <h3>Contact Information</h3>
                <p>Email: ljeanluc394@gmail.com</p>
                <p>Phone: +250780079152</p>
                <p>Location: Kigali, Rwanda</p>
              </div>
            </div>
          </body>
          </html>
        `);
      }
    } catch (error) {
      console.error('Error in root route handler:', error);
      res.writeHead(500);
      res.end('Server Error');
    }
  }
};

// Create HTTP server
const server = http.createServer((req, res) => {
  // Parse URL
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Normalize pathname
  pathname = pathname.replace(/\/$/, '');
  if (pathname === '') pathname = '/';
  
  console.log(`Request received for path: ${pathname}`);
  
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
  

  
  // 404 - Not Found
  console.log(`404 Not Found: ${pathname}`);
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end(`<h1>404 - Page Not Found</h1><p>Path: ${pathname}</p><p>Please check the server logs for more information.</p>`);
});



// Start the server
// Use 0.0.0.0 in Docker to allow external connections, localhost for local development
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

server.listen(PORT, HOST, () => {
  console.log(`Starting server on port ${PORT}`);
  console.log(`Server running on http://${HOST}:${PORT}`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close();
  if (db) db.end();
  process.exit(0);
});
