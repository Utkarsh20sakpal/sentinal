# 🛡️ Sentinel — Smart Apartment Visitor Security

A full-stack, real-time visitor management system for residential apartments.
Built with React, Node.js, MongoDB, and Socket.IO.

---

## ✨ Features

- **Wing-based architecture** — Wings A/B/C/D with scoped data per wing
- **Role-based access** — Guard, Resident, Admin each see only their data
- **OTP-gated entry** — Resident approves visitor → 6-digit OTP generated → Guard verifies at gate
- **Exit logging** — Guards log visitor departure; full entry/exit timeline stored
- **Real-time updates** — Socket.IO pushes live events across all dashboards
- **Risk scoring** — Suspicious visitor behaviour flagged automatically
- **Dark SaaS UI** — Glassmorphism, animated canvas background, micro-interactions

---

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + custom CSS |
| Animations | Framer Motion + GSAP |
| Backend | Node.js + Express 5 |
| Database | MongoDB + Mongoose |
| Real-time | Socket.IO |
| Auth | JWT (jsonwebtoken) + bcrypt |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### 1. Clone & install

```bash
git clone https://github.com/Utkarsh20sakpal/sentinal.git
cd sentinal

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Configure environment

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart-apartment
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
```

### 3. Run

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Open http://localhost:5173

---

## 👥 Roles & Flow

```
Guard (Wing X)
  → Registers visitor with flat number
  → System auto-prefixes Wing X
  → Resident of that flat gets notified (Socket.IO)

Resident
  → Approves/Rejects visitor
  → On approval: 6-digit OTP generated
  → Guard enters OTP at gate → visitor marked "entered"
  → Guard logs exit → full timeline recorded

Admin (Wing X)
  → Sees all Wing X visitor analytics
  → Charts, risk scores, rejection rates
```

---

## 📁 Project Structure

```
sentinal/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/   # Shared UI components, Navbar, etc.
│       ├── layouts/      # DashboardLayout with sidebar
│       ├── pages/        # GuardDashboard, ResidentDashboard, AdminDashboard, AuthPage, LandingPage
│       └── services/     # AuthContext, api.ts, socket.ts
└── server/          # Node.js + Express backend
    ├── controllers/ # authController, visitorController
    ├── middleware/  # authMiddleware (JWT + role guard)
    ├── models/      # User, Visitor (Mongoose schemas)
    ├── routes/      # authRoutes, visitorRoutes
    └── utils/       # OTP generation, risk scoring, socket setup
```

---

## 🔐 Security Notes

- JWT tokens expire in 24h
- Passwords hashed with bcrypt (10 rounds)
- All dashboard routes protected by role — wrong role redirected to own dashboard
- Wing-scoped queries — a Wing A guard cannot see Wing B data
