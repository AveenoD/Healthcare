const express = require('express')
const router = express.Router()
const db = require('../db')

// ─── BOOK APPOINTMENT ─────────────────────────
router.post('/book', (req, res) => {
  const { user_id, doctor_id, date, time } = req.body

  if (!user_id || !doctor_id || !date || !time) {
    return res.status(400).json({ message: 'All fields required' })
  }

  db.query(
    'INSERT INTO appointments (user_id, doctor_id, date, time) VALUES (?, ?, ?, ?)',
    [user_id, doctor_id, date, time],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Booking failed' })
      res.status(201).json({ message: '✅ Appointment booked successfully' })
    }
  )
})

// ─── GET USER APPOINTMENTS ────────────────────
router.get('/:user_id', (req, res) => {
  const { user_id } = req.params

  db.query(
    `SELECT a.id, a.date, a.time, 
            d.name as doctorName, 
            d.specialization, 
            d.hospital
     FROM appointments a
     JOIN doctors d ON a.doctor_id = d.id
     WHERE a.user_id = ?
     ORDER BY a.created_at DESC`,
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error' })
      res.json(results)
    }
  )
})

module.exports = router