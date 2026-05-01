# Smart Grocery App

Smart Grocery Application for Senior Design Project

---

# Project Overview

This project includes:
- Backend API (Node.js + Express + MongoDB)
- Mobile Frontend App (Expo + React Native)

---

# Tech Stack

## Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt (password hashing)
- multer (file uploads)
- Quagga2 (barcode scanning)
- External API: Open Food Facts

## Mobile App
- Expo
- React Native
- JavaScript
- React Navigation

---

# Features

## Backend
- User authentication (JWT)
- Grocery product management
- Barcode scanning support
- File uploads
- External food database integration

## Mobile App
- Login / Register screens
- Home screen
- Navigation system
- API integration with backend

---

# Project Structure

## Mobile App folders
- `src/navigation` → app navigation
- `src/screens` → UI screens
- `src/theme` → styling/colors
- `src/utils` → validation logic

---

# Prerequisites

- Node.js
- npm
- MongoDB (local or Atlas)
- Expo Go app (for mobile testing)

---

# Installation

## Backend setup
1. Clone repository
2. Create `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
