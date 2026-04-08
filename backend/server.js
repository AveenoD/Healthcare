const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

// ─── MIDDLEWARE ───────────────────────────────
app.use(cors())
app.use(express.json())

// ─── ROUTES (we'll uncomment as we build) ─────
app.use('/api/auth', require('./routes/auth'))
app.use('/api/doctors', require('./routes/doctors'))
app.use('/api/appointments', require('./routes/appointments'))
app.use('/api/schemes', require('./routes/schemes'))
// ─── TEST ROUTE ───────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🏥 Healthcare API Running' })
})

// ─── START SERVER ─────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})