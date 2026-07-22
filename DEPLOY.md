# Deploy: Backend on Render + Frontend on Netlify

This guide deploys the API to **Render** and the React app to **Netlify**.

---

## Before you start

1. Push this project to **GitHub** (or GitLab / Bitbucket).
2. Confirm **MongoDB Atlas** Network Access allows Render:
   - Atlas → Network Access → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`)
3. Have a **Gmail App Password** ready for SMTP (production email).
4. Deploy order:
   1. Backend (Render) first  
   2. Frontend (Netlify) second  
   3. Update Render `CLIENT_URL` to your Netlify URL  

---

## Part A — Deploy backend on Render

### Step 1: Create a Web Service

1. Go to [https://render.com](https://render.com) and sign in.
2. Click **New +** → **Web Service**.
3. Connect your GitHub account and select the **password-reset** repository.
4. Configure:

| Setting | Value |
|--------|--------|
| Name | `password-reset-api` (any name) |
| Region | Closest to you |
| Root Directory | `backend` |
| Runtime | `Node` |
| Build Command | `npm install --include=dev && npm run build` |
| Start Command | `npm start` |
| Instance Type | `Free` |

5. Click **Advanced** if needed, then add environment variables (next step).

### Step 2: Add environment variables on Render

In the Render service → **Environment**, add:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://viratjohn110_db_user:john@cluster0.p1abfhg.mongodb.net/password-reset?appName=Cluster0` |
| `CLIENT_URL` | `https://YOUR-SITE.netlify.app` *(update after Netlify deploy — no trailing slash)* |
| `RESET_TOKEN_EXPIRY_MINUTES` | `15` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | `viratjohn110@gmail.com` |
| `SMTP_PASS` | *your Gmail App Password* |
| `EMAIL_FROM` | `Password Reset <viratjohn110@gmail.com>` |

> Render sets `PORT` automatically. Do **not** hardcode it.

For the first deploy, you can temporarily set:

```text
CLIENT_URL=http://localhost:5173
```

Then change it to your real Netlify URL after the frontend is live.

### Step 3: Deploy

1. Click **Create Web Service**.
2. Wait for the build/logs to finish.
3. Open your service URL, for example:

```text
https://password-reset-api-xxxx.onrender.com/api/health
```

You should see:

```json
{ "success": true, "message": "API is healthy", "environment": "production" }
```

**Copy this base URL** (without `/api/health`) — you need it for Netlify.

Example API base for the frontend:

```text
https://password-reset-api-xxxx.onrender.com/api
```

---

## Part B — Deploy frontend on Netlify

### Step 1: Create a Netlify site

1. Go to [https://app.netlify.com](https://app.netlify.com) and sign in.
2. Click **Add new site** → **Import an existing project**.
3. Connect GitHub and select the **password-reset** repository.

### Step 2: Build settings

Netlify should read `netlify.toml` from the repo root. Confirm:

| Setting | Value |
|--------|--------|
| Base directory | `frontend` |
| Build command | `npm run build` |
| Publish directory | `frontend/dist` |

If Netlify shows publish as `dist` because base is `frontend`, that is also correct.

### Step 3: Add environment variable

1. Site settings → **Environment variables** → **Add a variable**.
2. Add:

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://password-reset-api-xxxx.onrender.com/api` |

Use your real Render URL. **No trailing slash** after `api`.

### Step 4: Deploy

1. Click **Deploy site**.
2. When finished, open your Netlify URL, for example:

```text
https://your-app-name.netlify.app
```

---

## Part C — Connect frontend and backend

### Step 1: Update Render `CLIENT_URL`

1. Render → your Web Service → **Environment**.
2. Set:

```text
CLIENT_URL=https://your-app-name.netlify.app
```

(no trailing slash)

3. Save. Render will restart the service.

This is required for:
- CORS (browser API calls from Netlify)
- Password-reset email links

### Step 2: Redeploy Netlify if needed

If you set `VITE_API_URL` **after** the first build, trigger a new deploy:

- Netlify → **Deploys** → **Trigger deploy** → **Deploy site**

Vite bakes `VITE_*` values in at **build time**.

---

## Part D — Verify the full flow

1. Open your Netlify site.
2. Register a new user with a real email you can open.
3. Go to **Forgot Password** and submit that email.
4. Check inbox for the reset mail (and spam).
5. Open the link → it should go to your Netlify `/reset-password/...` page.
6. Set a new password and log in.

Health check:

```text
https://YOUR-RENDER-URL.onrender.com/api/health
```

---

## Common issues

### CORS errors in the browser
- `CLIENT_URL` on Render must exactly match the Netlify URL (https, no trailing slash).
- Restart/redeploy Render after changing it.

### Frontend calls localhost / wrong API
- `VITE_API_URL` must be set in Netlify **before** (or then trigger) a production build.
- Value must end with `/api`.

### MongoDB connection failed on Render
- Atlas Network Access must allow `0.0.0.0/0`.
- Check username/password in `MONGODB_URI`.

### Emails not sending
- Use a Gmail **App Password**, not your normal password.
- Confirm `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` on Render.

### Render free tier sleep
- Free services sleep after inactivity. The first request can take 30–60 seconds.
- The frontend API timeout is 30s; if it fails once, retry after the service wakes up.

### React Router 404 on refresh
- Already handled by `netlify.toml` and `frontend/public/_redirects` (SPA fallback to `index.html`).

---

## Quick reference

| App | Host | Root / Base | Build | Start / Publish |
|-----|------|-------------|-------|-----------------|
| Backend | Render | `backend` | `npm install --include=dev && npm run build` | `npm start` |
| Frontend | Netlify | `frontend` | `npm run build` | `frontend/dist` |

| Env var | Where | Example |
|---------|-------|---------|
| `MONGODB_URI` | Render | Atlas connection string |
| `CLIENT_URL` | Render | `https://your-site.netlify.app` |
| `SMTP_*` / `EMAIL_FROM` | Render | Gmail SMTP settings |
| `VITE_API_URL` | Netlify | `https://your-api.onrender.com/api` |
