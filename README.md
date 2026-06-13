# Smart Grocery Mobile App

## 📌 Branch Purpose

This branch contains a fully dockerized version of the Smart Grocery application, including:

- 🧠 Node.js + Express backend
- 🍃 MongoDB database (Docker container)
- 📱 Expo React Native frontend (Web mode)
- 🔗 Fully containerized communication between services

The goal of this branch is to provide a **reproducible environment** that can be run on any machine with Docker installed, without manual setup or external dependencies.


## ▶️ How to Run the Project

### Step 0 — Install Docker

Ensure Docker Desktop is installed and running.

### Step 1 — Start the system

Open the project folder and run:

```bash
docker compose up --build
```

### Step 2 — Open via browser

After successful startup, open http://localhost:8081 via browser.