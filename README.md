# Health Passport

Secure medical data management with patient-controlled consent and QR-based sharing.

## Overview
Health Passport is a full-stack web app that lets:
- **Patients** manage their medical profile (medical history, prescriptions, emergency details) and control what data is shared.
- **Providers** request access to specific patient data after scanning a patient QR code.
- Both parties rely on a **consent workflow** (grant/revoke) and the system maintains **audit logs** of access.

> Note: This project handles sensitive information. Do **not** deploy to production without a complete security/privacy review.

## Tech Stack
- **Client:** React (Vite)
- **Server:** Node.js + Express
- **Auth:** Passport (Google OAuth)
- **Database:** MongoDB (Mongoose)

## Repository Structure
- `client/` – React (Vite) frontend
- `server/` – Express API backend

## Features

### Patient
- Google login
- Role selection (PATIENT)
- Manage profile:
  - Medical history
  - Prescriptions
  - Emergency data (blood group, allergies, current medications)
- Respond to provider requests (grant/revoke)
- View audit logs (normal + emergency)

### Provider
- Google login
- Role selection (PROVIDER)
- Scan patient QR
- Request specific data scopes
- View consented patient data
- View provider access logs

## API (high level)
The server mounts routes under:
- `/auth` – authentication & profile
- `/patient` – patient profile/data
- `/consent` – patient consent workflow (pending requests, respond, revoke, history)
- `/access` – provider access endpoints
- `/audit` – access logs and consented-patient views

The API enables CORS with credentials and expects a frontend origin like `http://localhost:5173`.

## Environment Variables

### Server (`.env` at repo root)
Create a `.env` at the repo root (the server loads it) with at least:

```bash
# Server
PORT=3000
SESSION_SECRET=your_session_secret
NODE_ENV=development

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALL_BACKURL=...

# DB
DB_URL=mongodb://127.0.0.1:27017/healthpassport

# Client origins used by CORS/session redirects
FRONTEND_URL=http://localhost:5173
# Optional comma-separated list for multi-environment deploys
# FRONTEND_URLS=https://health-passport.vercel.app,https://health-passport-git-main.vercel.app
```

## Monorepo Scripts

From the repository root:

```bash
npm install
npm run dev
```

Available root scripts:
- `npm run dev` - runs frontend + backend concurrently
- `npm run dev:client` - runs only Vite frontend
- `npm run dev:server` - runs only Express backend
- `npm run build` - builds frontend for production
- `npm run lint` - runs frontend lint checks
- `npm run start` - starts backend in production mode

## Deployment

### Vercel (Frontend)
- Use the root repo with provided `vercel.json`
- Build command: `npm run build --workspace client`
- Output directory: `client/dist`
- Set `VITE_API_URL` to your Render backend URL

### Render (Backend)
- Use the provided `render.yaml` or equivalent dashboard settings
- Build command: `npm install`
- Start command: `npm run start --workspace server`
- Set required environment variables from the section above
- In production, set `FRONTEND_URLS` to include your Vercel domain(s)
