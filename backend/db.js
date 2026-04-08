const mysql = require('mysql2')
require('dotenv').config()

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST,
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
})

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.log('❌ DB Connection Failed:', err.message)
    return
  }
  console.log('✅ MySQL Connected Successfully')
  connection.release()
})

module.exports = pool

// Better error handling + retry logic
db.connect((err) => {
  if (err) {
    console.error('❌ DB Connection Failed:', err.code, '-', err.message);
    console.error('Error details:', err);
    
    // Extra info for debugging
    if (err.code === 'ETIMEDOUT') {
      console.error('💡 Tip: Check if MySQL service is in same region as Web Service');
      console.error('💡 Try using Internal connection details if available');
    }
  } else {
    console.log('✅ MySQL Connected Successfully');
  }
});

// Handle connection errors gracefully
db.on('error', (err) => {
  console.error('DB Error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Reconnecting...');
  }
});

module.exports = db;