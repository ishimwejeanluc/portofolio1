const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Lukatoni123', // Update with your MySQL password
  database: 'portofolio',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool
const createConnection = async () => {
  try {
    const pool = mysql.createPool(dbConfig);
    return pool;
  } catch (error) {
    console.error('Error creating database connection:', error);
    throw error;
  }
};

module.exports = { createConnection };
