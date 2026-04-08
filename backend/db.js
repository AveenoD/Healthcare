const mysql = require('mysql2');
require('dotenv').config();

// Create the connection pool using the Public variables
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT, 10), // Port must be a number
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10 seconds
  connectTimeout: 20000         // 20 seconds for external network latency
});

// Test the connection immediately
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ DB Connection Failed:', err.message);
    console.error('DEBUG INFO: Attempting to connect to ' + process.env.MYSQL_HOST + ':' + process.env.MYSQL_PORT);
    return;
  }
  console.log('✅ MySQL Connected Successfully via Public Proxy');
  connection.release();
});

// Critical: Handle unexpected connection drops
pool.on('error', (err) => {
  console.error('Unexpected Pool Error:', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Database connection was closed. Pool will attempt to reconnect on next query.');
  }
});

module.exports = pool;
