const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Lukatoni123',
  database: process.env.DB_NAME || 'portofolio',
  port: process.env.DB_PORT || 3306,
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
