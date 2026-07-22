# Password Reset Flow

Production-ready MERN password reset app with **React + TypeScript**, **Node.js + TypeScript**, **MongoDB**, **Bootstrap**, and **Nodemailer**.

## Features

- Forgot password page with email lookup
- Random reset token generated, hashed, and stored in MongoDB
- Reset link emailed to the user
- Token validation on link open
- Password update clears the stored token
- Token expiry with user-facing alert when expired
- Register / login helpers so you can create test users
- Rate limiting, Helmet, CORS, Zod validation, bcrypt password hashing

## Project structure

```text
password-reset/
├── backend/     Express + TypeScript API
└── frontend/    React + TypeScript + Bootstrap UI
```

## Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)
- SMTP credentials for production email (optional in development)

## Setup

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure backend environment

Copy `backend/.env.example` to `backend/.env` and update values:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/password-reset
CLIENT_URL=http://localhost:5173
RESET_TOKEN_EXPIRY_MINUTES=15

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="Password Reset <your-email@gmail.com>"
```

### 3. Configure frontend environment

`frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Run locally

```bash
npm run dev:backend
npm run dev:frontend
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/health

## Deploy (Render + Netlify)

Full step-by-step guide: **[DEPLOY.md](./DEPLOY.md)**

1. **Render (backend)** — Root Directory: `backend`  
   Build: `npm install --include=dev && npm run build`  
   Start: `npm start`

2. **Netlify (frontend)** — Base directory: `frontend`  
   Build: `npm run build`  
   Publish: `dist`  
   Env: `VITE_API_URL=https://YOUR-RENDER-URL.onrender.com/api`

3. Set Render `CLIENT_URL` to your Netlify site URL.
