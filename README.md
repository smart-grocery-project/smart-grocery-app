# Smart Grocery

Smart Grocery is a mobile (Android) application that helps users make healthier, budget-friendly grocery decisions. It combines barcode scanning, AI nutrition-label reading, inventory and expiry tracking, product comparison, and weekly budget/nutrition planning in one app, backed by a cloud-deployed REST API.

**Senior design project** — Ilia State University, Computer Science, Spring 2026. Supervisor: Dr. Erekle Magradze. Tbilisi, Georgia.
Team: Abedelwahab Elshaikh, Vladimir Drevin.

- **Live backend:** https://smart-grocery-app-f00u.onrender.com

## Tech stack

- **Frontend:** React Native (Expo), React Navigation, Axios
- **Backend:** Node.js + Express (REST API), Mongoose
- **Database:** MongoDB Atlas (cloud)
- **Auth:** JWT + bcrypt
- **External services:** Open Food Facts (product data), Groq / Llama vision model (AI label reading)
- **DevOps:** Docker, Render (cloud hosting + auto-deploy), GitHub Actions (CI), EAS Build (APK), EAS Update (OTA)

## Repository structure

- `backend/` — the Node/Express REST API (Dockerized, deployed on Render)
- `frontend/` — the React Native / Expo mobile app
- `docker-compose.yml`, `.github/workflows/ci.yml` — local orchestration and CI pipeline

## Branches

- **`main`** — the final, deployed version of Smart Grocery (backend + mobile app). This is the branch to review.
- **`Abedelwahab`** — Abedelwahab Elshaikh's development branch: the full mobile app, backend integration, and the entire Docker / cloud / CI-CD / OTA deployment pipeline.
- **`vladimir`** — Vladimir Drevin's development branch: backend domain model and core API, initial test suite, and project planning and documentation.
- **`pre-restructure-backup`** — a snapshot taken before the repository was reorganized into the `backend/` and `frontend/` folders; kept as a safety backup.

## Running locally

**Backend**
1. `cd backend`
2. `npm install`
3. Create a `.env` file from `.env.example` (MongoDB URI, JWT secret, Groq API key).
4. `npm start` (or `docker compose up` from the repository root).

**Frontend**
1. `cd frontend`
2. `npm install`
3. `npx expo start` — scan the QR code with Expo Go on Android, or press `a` for an Android emulator.
