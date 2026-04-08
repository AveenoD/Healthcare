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

pool.getConnection((err, connection) => {
  if (err) {
    console.log('❌ DB Connection Failed:', err.message)
    return
  }
  console.log('✅ MySQL Connected Successfully')
  connection.release()
})

module.exports = pool