const mysql = require('mysql2');
require('dotenv').config();

console.log("=== DB Connection Debug ===");
console.log("MYSQLHOST:", process.env.MYSQLHOST);
console.log("MYSQLPORT:", process.env.MYSQLPORT);
console.log("MYSQLUSER:", process.env.MYSQLUSER);
console.log("MYSQLDATABASE:", process.env.MYSQLDATABASE);

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,        // Render ka internal hostname hona chahiye
  port: parseInt(process.env.MYSQLPORT) || 3306,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  connectTimeout: 20000,              // 20 seconds timeout
  acquireTimeout: 20000
});

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