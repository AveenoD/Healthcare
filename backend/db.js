const mysql = require('mysql2');

// Only load dotenv if not in a production environment (like Render)
// Render injects variables directly, so dotenv is not needed there.
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

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
    // Log all environment variables related to MySQL for debugging
    console.error('DEBUG: MYSQL_HOST:', process.env.MYSQL_HOST);
    console.error('DEBUG: MYSQL_PORT:', process.env.MYSQL_PORT);
    console.error('DEBUG: MYSQL_USER:', process.env.MYSQL_USER);
    console.error('DEBUG: MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
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
