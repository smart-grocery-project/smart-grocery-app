# Smart Grocery App

Backend API for the Smart Grocery application.  

---

# Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt (password hashing)
- multer (file uploads)
- Quagga2 (barcode scanning)
- External API: Open Food Facts

---

# Prerequisites

Before running the project, make sure you have:

- Node.js
- npm
- MongoDB (local installation or MongoDB Atlas)
- API testing tool (Postman recommended) for testing endpoints

---

# Installation

## 1. Clone repository
## 2. Create `.env` file in root directory

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## 3. Run the server

```bash
npm install
npm run dev
```

## Server will run on

```
http://localhost:3000
```
