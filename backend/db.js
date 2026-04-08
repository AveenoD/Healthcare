const mysql = require('mysql2')
require('dotenv').config()

const db = mysql.createConnection({
  host: process.env.MYSQL_PUBLIC_URL,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE
})

db.connect((err) => {
  if (err) {
    console.log('❌ DB Connection Failed:', err.message)
    return
  }
  console.log('✅ MySQL Connected Successfully')
})

module.exports = db