const mysql = require('mysql2');
require('dotenv').config();

console.log("=== DB ENV DEBUG ===");
console.log("MYSQLHOST:", process.env.MYSQLHOST ? "✅ Exists" : "❌ Missing");
console.log("MYSQLPORT:", process.env.MYSQLPORT ? "✅ Exists" : "❌ Missing");
console.log("MYSQLUSER:", process.env.MYSQLUSER ? "✅ Exists" : "❌ Missing");
console.log("MYSQLPASSWORD:", process.env.MYSQLPASSWORD ? "✅ Exists (hidden)" : "❌ Missing");
console.log("MYSQLDATABASE:", process.env.MYSQLDATABASE ? "✅ Exists" : "❌ Missing");

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,          // ← yeh tere Render mein hai
  port: process.env.MYSQLPORT || 3306,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE
});

db.connect((err) => {
  if (err) {
    console.error('❌ DB Connection Failed:', err.message);
  } else {
    console.log('✅ MySQL Connected Successfully');
  }
});

module.exports = db;