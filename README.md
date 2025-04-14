# 🚗 Ride-Sharing App

A full-stack ride-sharing platform built with:

- 🧠 **Frontend:** Next.js (React-based)
- 🚀 **Backend:** Express.js with Prisma ORM
- 🛢️ **Database:** PostgreSQL (via Neon.tech)
- 🔐 **Auth:** JWT-based Authentication
- 📧 **Email:** Nodemailer with OTP Verification

---

## 📦 Project Structure


---

## 🔧 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/PatelDhruv2/Ride-Sharing.git
cd Ride-Sharing
cd backend
npm install
Create a .env file in the backend/ directory using the example below:

npx prisma generate
npx prisma migrate dev
cd ../frontend
npm install
npm run dev
# .env.example (backend)

DATABASE_URL="your_postgres_connection_string"
JWT_SECRET="your_jwt_secret"
EMAIL_USER="your_email@example.com"
EMAIL_PASS="your_email_app_password"
🔐 Features
JWT-based Authentication

OTP Email Verification

Driver Ride Management (Start/End)

Booking Management with Status

Prisma ORM Integration
