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
```

---

# 6. Testing and Validation

## Testing Approach

This project relied primarily on **manual and functional validation** rather than automated test suites. Given the Senior Design timeline and the focus on building a working prototype, testing was structured around verifying core features end-to-end through direct interaction with the API and mobile UI.

### Unit Tests

No dedicated unit test framework (e.g., Jest, Mocha) was configured for either the backend or the mobile app. The backend `package.json` includes a placeholder test script that exits with an error, and the mobile app has no test script or test dependencies. Individual functions such as `compareProductToPlan` in `comparatorService.js` and form validators in `src/utils/validation.js` were validated manually by inspecting inputs and expected outputs during development.

### Integration Tests

Backend integration was validated manually using API clients (e.g., Postman or `curl`) against a running Express server connected to MongoDB. Key flows tested included:

- User registration and login with JWT token issuance
- Protected route access via `authMiddleware`
- Barcode image upload → Quagga2 decoding → Open Food Facts lookup → product creation
- Inventory CRUD operations and expiration filtering
- Weekly plan creation and product-to-plan comparison
- Scan history recording

The mobile app was **not yet integrated** with the backend API at the time of validation. Login and registration screens perform client-side validation only and navigate locally without calling `/users` endpoints.

### End-to-End Tests

No automated E2E framework (e.g., Detox, Cypress, Playwright) was used. Manual E2E testing was limited to:

- **Mobile UI flow:** Launch app in Expo Go → register/login → view home dashboard → navigate quick-action placeholders
- **Backend smoke test:** Start server → verify `GET /` returns a success response → exercise authenticated endpoints with a valid JWT
- **Docker deployment:** `docker-compose up` to confirm backend and frontend containers build and start (with noted port configuration differences between local and containerized runs)

### Validation Beyond Tests

| Layer | Validation Method |
|-------|-------------------|
| Mobile forms | Client-side validation (`validateLogin`, `validateRegister`) for email format, required fields, password length, and password confirmation |
| Backend controllers | Duplicate email/barcode checks, required field enforcement, JWT authentication on protected routes |
| Data models | Mongoose schema constraints (e.g., non-negative nutrition and budget values) |
| File uploads | Image-only filter via multer middleware |
| Web scaffold | ESLint static analysis on `test-frontend` |

## Coverage and Outcomes

- **Automated test coverage:** 0% — no coverage tooling (Istanbul, nyc, etc.) is configured
- **Backend API:** All major endpoints were manually verified and respond correctly when MongoDB is connected and environment variables are set
- **Mobile app:** UI screens render correctly on Expo Go; navigation between Login, Register, and Home works as expected
- **Known gaps:** Frontend–backend integration is incomplete; budget and nutrition summaries on the home screen use placeholder data; no load or stress testing was performed

---

# 7. Project Outcomes and Evaluation

## Objectives

The Smart Grocery App was designed to help users manage grocery shopping with an emphasis on **budget tracking**, **nutrition awareness**, and **barcode-based product lookup**. The intended user experience combines scanning products in-store, comparing them against personal weekly goals, and maintaining a household inventory with expiration awareness.

## Deliverables

| Deliverable | Status | Description |
|-------------|--------|-------------|
| REST API backend | Complete | Node.js + Express + MongoDB with JWT auth, product management, barcode scanning, inventory, weekly plans, comparison logic, and scan history |
| Mobile app (Expo) | Prototype | Polished UI with login, registration, and home dashboard; quick actions are placeholders not yet wired to the API |
| Web frontend | Scaffold | Vite + React boilerplate for containerized deployment; not a functional grocery web client |
| Docker setup | Partial | `docker-compose.yml` orchestrates backend and frontend containers |
| Documentation | Complete | README with setup instructions, tech stack, and project structure |

## Feature Maturity

| Feature | Backend | Mobile UI | Integrated |
|---------|---------|-----------|------------|
| User authentication | Yes | UI only | No |
| Barcode scanning | Yes (Quagga2 + Open Food Facts) | Placeholder | No |
| Inventory management | Yes (CRUD + expiration) | Placeholder | No |
| Weekly budget/nutrition plan | Yes | Placeholder data | No |
| Product-to-plan comparison | Yes | Not exposed | No |
| Scan history | Yes | Placeholder | No |

## Performance

No formal performance benchmarks were recorded. Informal observations during development:

- API response times for standard CRUD operations were acceptable for a single-user demo environment
- Open Food Facts API lookups introduce variable latency depending on network conditions and product availability in the database
- Server-side barcode decoding via Quagga2 on uploaded images is functional but not optimized for high-throughput or real-time camera scanning

## User Feedback

No formal user studies or surveys were conducted as part of this repository. Informal feedback during team demos highlighted:

- The mobile home screen layout and navigation were intuitive
- The gap between the polished UI and the functional backend was identified as the primary next step for a production-ready product
- Budget comparison is limited when product prices default to `0` from Open Food Facts (prices must be entered manually for meaningful budget analysis)

## Overall Evaluation

The project **met its core backend objectives** by delivering a functional, multi-feature REST API that demonstrates barcode-driven product enrichment, nutrition and budget comparison, and inventory management. The **mobile frontend provides a strong UI foundation** but remains a prototype disconnected from the API. The project successfully demonstrates the technical feasibility of combining Open Food Facts data with personal grocery planning, while clearly identifying integration, testing, and deployment polish as areas for future work.

---

# 8. Similar Projects and Comparative Analysis

## Overview

Several existing applications address parts of the Smart Grocery problem space—grocery lists, nutrition tracking, barcode scanning, and pantry management—but few combine all of these capabilities in a single self-hosted, budget-aware system. The table below compares Smart Grocery with representative alternatives.

## Comparison Table

| System | Grocery Lists | Barcode Scan | Nutrition Tracking | Budget Planning | Inventory / Pantry | Self-Hosted API |
|--------|:-------------:|:------------:|:------------------:|:---------------:|:------------------:|:---------------:|
| **Smart Grocery (this project)** | Planned | Yes (server-side) | Yes (weekly targets) | Yes | Yes (with expiration) | Yes |
| AnyList / OurGroceries | Yes | Limited | No | No | Basic | No |
| MyFitnessPal / Lose It! | No | Yes | Yes (daily logging) | No | No | No |
| Yuka | No | Yes | Yes (product scoring) | No | No | No |
| Open Food Facts (official app) | No | Yes | Product info only | No | No | No (uses public API) |
| Out of Milk / Pantry Check | Yes | Yes | No | No | Yes | No |
| Mealime / PlateJoy | Yes (meal-focused) | Limited | Yes (meal plans) | Partial | No | No |

## Technical Comparison

| Dimension | Smart Grocery | Typical Commercial Apps |
|-----------|---------------|-------------------------|
| Architecture | Custom MERN-like stack (MongoDB + Express + React Native) | Proprietary cloud backends, often microservices |
| Product data source | Open Food Facts (free, crowdsourced) | Proprietary or licensed nutrition databases |
| Barcode decoding | Server-side Quagga2 on uploaded images | Usually client-side camera SDKs (ZXing, ML Kit) |
| Authentication | Self-hosted JWT | OAuth, SSO, social login |
| Nutrition model | Per-product vs. weekly targets | Daily/meal-level calorie and macro tracking |
| Deployment | Docker Compose (dev/demo) | Cloud-native, CDN, app store distribution |
| Automated testing | None | Extensive QA pipelines and CI/CD |

## Strengths of This Solution

1. **Unified pipeline:** Barcode scan → external nutrition lookup → comparison against personal weekly budget and nutrition targets in one backend flow
2. **Open data:** Leverages Open Food Facts, avoiding licensing costs for nutrition data
3. **Personal inventory with expiration:** Tracks household stock and supports expiration filtering, a feature often missing from pure nutrition apps
4. **Scan history:** Records past scans for repeat purchase awareness
5. **Self-hosted and extensible:** Full control over data, auth, and API design without vendor lock-in

## Limitations Compared to Existing Systems

1. **No mobile–backend integration yet**, whereas commercial apps ship as fully connected products
2. **No recipe or meal planning**, unlike Mealime or PlateJoy
3. **No cross-store price comparison**, unlike retailer grocery apps
4. **No push notifications** for expiring inventory items
5. **No offline mode** for in-store use without network connectivity
6. **Simplified nutrition model** (weekly targets vs. per-product) compared to daily tracking apps like MyFitnessPal
7. **Price data gap:** Open Food Facts does not provide retail prices, limiting budget comparison unless prices are entered manually
8. **No automated test suite**, whereas mature products rely on extensive QA

## Conclusion

Smart Grocery occupies a niche between **nutrition scanners** (Yuka, Open Food Facts), **calorie trackers** (MyFitnessPal), and **pantry managers** (Out of Milk) by attempting to combine barcode-driven nutrition lookup with personal budget and inventory management. Its main differentiator is the integrated comparison engine that evaluates a scanned product against a user's weekly plan. To reach parity with commercial offerings, the highest-priority improvements are full mobile–backend integration, client-side camera scanning, manual or crowdsourced price entry, and automated testing with CI/CD.
