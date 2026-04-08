const express = require('express')
const router = express.Router()
const db = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// ─── REGISTER ────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, phone, password, age } = req.body

  // Check all fields
  if (!name || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }

  // Check if phone already exists
  db.query('SELECT * FROM users WHERE phone = ?', [phone], async (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' })

    if (results.length > 0) {
      return res.status(400).json({ message: 'Phone already registered' })
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10)

    // Insert user
    db.query(
      'INSERT INTO users (name, phone, password, age) VALUES (?, ?, ?, ?)',
      [name, phone, hashed, age || null],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Registration failed' })
        res.status(201).json({ message: '✅ Registered successfully' })
      }
    )
  })
})

// ─── LOGIN ────────────────────────────────────
router.post('/login', (req, res) => {
  const { phone, password } = req.body

  if (!phone || !password) {
    return res.status(400).json({ message: 'Phone and password required' })
  }

  // Find user by phone
  db.query('SELECT * FROM users WHERE phone = ?', [phone], async (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' })

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const user = results[0]

    // Check password
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ message: 'Wrong password' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: '✅ Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        age: user.age
      }
    })
  })
})

module.exports = router