const express = require('express')
const router = express.Router()
const db = require('../db')

// ─── GET ALL DOCTORS ──────────────────────────
router.get('/', (req, res) => {
  db.query('SELECT * FROM doctors', (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' })
    res.json(results)
  })
})

module.exports = router