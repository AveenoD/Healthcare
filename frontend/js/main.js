// ─── API BASE URL ─────────────────────────────
const API = 'http://localhost:5000/api'

// ─── CURRENT PAGE ─────────────────────────────
const page = window.location.pathname.split('/').pop()

// ─── LOAD USER NAME ──────────────────────────
function loadUser() {
  const user = JSON.parse(localStorage.getItem('user'))
  const u = user || { name: 'User' }

  const topbarName = document.getElementById('topbarName')
  const userName = document.getElementById('userName')

  if (topbarName) topbarName.textContent = u.name
  if (userName) userName.textContent = u.name
}

// ─── LOGOUT ──────────────────────────────────
function setupLogout() {
  const btn = document.getElementById('logoutBtn')
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      window.location.href = 'index.html'
    })
  }
}

// ─── LOGIN ────────────────────────────────────
async function loginUser() {
  const phone = document.getElementById('phone')?.value
  const password = document.getElementById('password')?.value

  if (!phone || !password) {
    alert('Please enter phone and password')
    return
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    })

    const data = await res.json()

    if (res.ok) {
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('token', data.token)
      window.location.href = 'dashboard.html'
    } else {
      alert('❌ ' + data.message)
    }
  } catch (err) {
    alert('❌ Server not reachable. Is it running?')
  }
}

// ─── REGISTER ────────────────────────────────
async function registerUser() {
  const name = document.getElementById('regName')?.value
  const phone = document.getElementById('regPhone')?.value
  const password = document.getElementById('regPassword')?.value
  const age = document.getElementById('regAge')?.value

  if (!name || !phone || !password) {
    alert('Please fill all fields')
    return
  }

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, password, age })
    })

    const data = await res.json()

    if (res.ok) {
      alert('✅ Registered successfully! Please login.')
      window.location.href = 'index.html'
    } else {
      alert('❌ ' + data.message)
    }
  } catch (err) {
    alert('❌ Server not reachable. Is it running?')
  }
}

// ─── SELECTED DOCTOR ─────────────────────────
let selectedDoctor = null

function selectDoctor(id, name, specialization) {
  selectedDoctor = { id, name, specialization }

  // Highlight selected card
  document.querySelectorAll('.doctor-card').forEach(card => {
    card.classList.remove('selected')
  })
  const activeCard = document.querySelector(`.doctor-card[data-id="${id}"]`)
  if (activeCard) activeCard.classList.add('selected')

  // Update booking box
  const box = document.getElementById('selectedDoctorBox')
  if (box) {
    box.classList.add('filled')
    box.innerHTML = `
      <div class="selected-doctor-info">
        <strong>👨‍⚕️ ${name}</strong>
        <span>${specialization}</span>
      </div>
    `
  }
}

// ─── LOAD DOCTORS FROM API ────────────────────
async function loadDoctors() {
  const container = document.getElementById('doctorList')
  if (!container) return

  try {
    const res = await fetch(`${API}/doctors`)
    const doctors = await res.json()

    container.innerHTML = doctors.map(doc => `
      <div class="doctor-card" data-id="${doc.id}">
        <div class="doctor-info">
          <div class="doctor-avatar">👨‍⚕️</div>
          <div>
            <strong>${doc.name}</strong>
            <span>${doc.specialization}</span>
            <small>🏥 ${doc.hospital}</small>
          </div>
        </div>
        <button class="btn-primary btn-sm"
          onclick="selectDoctor(${doc.id}, '${doc.name}', '${doc.specialization}')">
          Book Appointment
        </button>
      </div>
    `).join('')

  } catch (err) {
    container.innerHTML = `<p class="no-selection">❌ Could not load doctors.</p>`
  }
}

// ─── BOOK APPOINTMENT VIA API ─────────────────
async function confirmBooking() {
  if (!selectedDoctor) {
    alert('Please select a doctor first.')
    return
  }

  const date = document.getElementById('apptDateInput').value
  const time = document.getElementById('apptTimeInput').value

  if (!date || !time) {
    alert('Please select both date and time.')
    return
  }

  const user = JSON.parse(localStorage.getItem('user'))
  if (!user) {
    alert('Please login first.')
    window.location.href = 'index.html'
    return
  }

  try {
    const res = await fetch(`${API}/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        doctor_id: selectedDoctor.id,
        date,
        time
      })
    })

    const data = await res.json()

    if (res.ok) {
      alert(`✅ Appointment booked with ${selectedDoctor.name}`)

      // Reset form
      selectedDoctor = null
      document.getElementById('apptDateInput').value = ''
      document.getElementById('apptTimeInput').value = ''
      document.getElementById('selectedDoctorBox').classList.remove('filled')
      document.getElementById('selectedDoctorBox').innerHTML = `
        <p class="no-selection">👆 Select a doctor from the list</p>
      `
      document.querySelectorAll('.doctor-card')
        .forEach(c => c.classList.remove('selected'))

      loadMyAppointments()
    } else {
      alert('❌ ' + data.message)
    }
  } catch (err) {
    alert('❌ Server not reachable.')
  }
}

// ─── LOAD MY APPOINTMENTS FROM API ───────────
async function loadMyAppointments() {
  const container = document.getElementById('myAppointments')
  if (!container) return

  const user = JSON.parse(localStorage.getItem('user'))
  if (!user) return

  try {
    const res = await fetch(`${API}/appointments/${user.id}`)
    const appointments = await res.json()

    if (appointments.length === 0) {
      container.innerHTML = `<p class="no-selection">No appointments booked yet.</p>`
      return
    }

    container.innerHTML = appointments.map(appt => `
      <div class="my-appt-card">
        <strong>👨‍⚕️ ${appt.doctorName}</strong>
        <span>${appt.specialization}</span><br/>
        <span>🏥 ${appt.hospital}</span><br/>
        <span>📅 ${appt.date} at ${appt.time}</span>
      </div>
    `).join('')

  } catch (err) {
    container.innerHTML = `<p class="no-selection">❌ Could not load appointments.</p>`
  }
}

// ─── LOAD UPCOMING APPT ON DASHBOARD ─────────
async function loadUpcomingAppointment() {
  const user = JSON.parse(localStorage.getItem('user'))
  if (!user) return

  const doctorEl = document.getElementById('apptDoctor')
  const specEl = document.getElementById('apptSpecialization')
  const dateEl = document.getElementById('apptDate')

  if (!doctorEl) return

  try {
    const res = await fetch(`${API}/appointments/${user.id}`)
    const appointments = await res.json()

    if (appointments.length === 0) return

    const latest = appointments[0]
    doctorEl.textContent = latest.doctorName
    if (specEl) specEl.textContent = latest.specialization
    if (dateEl) dateEl.textContent = `${latest.date} at ${latest.time}`

  } catch (err) {
    console.log('Could not load upcoming appointment')
  }
}

// ─── SETUP BOOKING BUTTON ─────────────────────
function setupBookingBtn() {
  const btn = document.getElementById('confirmBookingBtn')
  if (btn) btn.addEventListener('click', confirmBooking)
}

// ─── ATTACH LOGIN BUTTON ──────────────────────
const loginBtn = document.getElementById('loginBtn')
if (loginBtn) loginBtn.addEventListener('click', loginUser)

// ─── SCHEMES DATA (for filtering) ────────────
let allSchemes = []

// ─── LOAD SCHEMES FROM API ────────────────────
async function loadSchemes() {
  const container = document.getElementById('schemesList')
  if (!container) return

  try {
    const res = await fetch(`${API}/schemes`)
    allSchemes = await res.json()
    renderSchemes(allSchemes)
  } catch (err) {
    container.innerHTML = `<p class="no-selection">❌ Could not load schemes.</p>`
  }
}

// ─── RENDER SCHEMES ───────────────────────────
function renderSchemes(schemes) {
  const container = document.getElementById('schemesList')
  if (!container) return

  if (schemes.length === 0) {
    container.innerHTML = `<p class="no-selection">No schemes found.</p>`
    return
  }

  const icons = ['🏥', '🏛️', '👩‍⚕️', '💊', '🩺', '❤️']

  container.innerHTML = schemes.map((scheme, i) => `
    <div class="scheme-card">
      <div class="scheme-icon">${icons[i % icons.length]}</div>
      <h4>${scheme.name}</h4>
      <p>${scheme.description}</p>
      <span class="scheme-tag">✅ ${scheme.eligibility}</span>
      <button class="btn-primary btn-sm"
        onclick="openModal(${scheme.id})">
        View Details
      </button>
    </div>
  `).join('')
}

// ─── FILTER SCHEMES ───────────────────────────
function filterSchemes() {
  const query = document.getElementById('schemeSearch')
    .value.toLowerCase()
  const filtered = allSchemes.filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.description.toLowerCase().includes(query) ||
    s.eligibility.toLowerCase().includes(query)
  )
  renderSchemes(filtered)
}

// ─── OPEN MODAL ───────────────────────────────
function openModal(id) {
  const scheme = allSchemes.find(s => s.id === id)
  if (!scheme) return

  document.getElementById('modalTitle').textContent = scheme.name
  document.getElementById('modalDescription').textContent = scheme.description
  document.getElementById('modalEligibility').textContent = scheme.eligibility
  document.getElementById('modalBenefits').textContent = scheme.benefits

  document.getElementById('modalOverlay').classList.add('active')
}

// ─── CLOSE MODAL ──────────────────────────────
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active')
}

// ─── DOCTORS PAGE ─────────────────────────────
let allDoctorsData = []

async function loadDoctorsPage() {
  const container = document.getElementById('doctorsGrid')
  if (!container) return

  try {
    const res = await fetch(`${API}/doctors`)
    allDoctorsData = await res.json()
    renderDoctorsGrid(allDoctorsData)
  } catch (err) {
    container.innerHTML = `<p class="no-selection">❌ Could not load doctors.</p>`
  }
}

function renderDoctorsGrid(doctors) {
  const container = document.getElementById('doctorsGrid')
  if (!container) return

  if (doctors.length === 0) {
    container.innerHTML = `<p class="no-selection">No doctors found.</p>`
    return
  }

  container.innerHTML = doctors.map(doc => `
    <div class="doctor-grid-card">
      <div class="doctor-grid-avatar">👨‍⚕️</div>
      <h4>${doc.name}</h4>
      <span class="spec-tag">${doc.specialization}</span>
      <span class="hospital-name">🏥 ${doc.hospital}</span>
      <button class="btn-primary btn-sm"
        onclick="window.location.href='appointments.html'">
        Book Appointment
      </button>
    </div>
  `).join('')
}

function filterDoctors() {
  const search = document.getElementById('doctorSearch')
    ?.value.toLowerCase()
  const spec = document.getElementById('specializationFilter')
    ?.value.toLowerCase()

  const filtered = allDoctorsData.filter(doc => {
    const matchSearch =
      doc.name.toLowerCase().includes(search) ||
      doc.specialization.toLowerCase().includes(search)
    const matchSpec = spec
      ? doc.specialization.toLowerCase().includes(spec)
      : true
    return matchSearch && matchSpec
  })

  renderDoctorsGrid(filtered)
}
// ─── MOBILE SIDEBAR TOGGLE ────────────────────
function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open')
  document.querySelector('.sidebar-overlay').classList.toggle('active')
}

// Add overlay div to body on load
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.sidebar-overlay')) {
    const overlay = document.createElement('div')
    overlay.className = 'sidebar-overlay'
    overlay.onclick = toggleSidebar
    document.body.appendChild(overlay)
  }
})

// ─── INIT — RUNS ON EVERY PAGE ────────────────
loadUser()
setupLogout()
setupBookingBtn()
loadDoctors()
loadMyAppointments()
loadUpcomingAppointment()
loadSchemes()
loadDoctorsPage()