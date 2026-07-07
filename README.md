# Esports Battle - MERN Tournament Management Platform

[![MERN CI](https://github.com/yash-yadav1804/Esports-Battle/actions/workflows/ci.yml/badge.svg)](https://github.com/yash-yadav1804/Esports-Battle/actions/workflows/ci.yml)

Esports Battle is a full-stack MERN esports tournament management platform where players can create teams, register for tournaments, access match rooms, submit results, and track performance. Organizers can manage their own tournaments and match rooms, while admins and superAdmins can control platform-level operations.

## 🌐 Live Demo

- Frontend: https://esports-battle-coral.vercel.app
- Backend API: https://esports-battle-api.onrender.com

---

## 🚀 Features

- Player registration and login with JWT authentication
- Team creation, join requests, approvals, captain transfer, and team management
- Organizer application and admin approval workflow
- Tournament creation and role-based tournament management
- Match room creation and secure room password access
- Room passwords visible only to eligible registered teams or authorized managers
- Result submission and approval system
- Organizer can approve results only for their own tournaments
- Admin and superAdmin platform control
- Notifications for team requests and tournament updates
- Public landing page and dashboard-style UI

---

## 📚 API Documentation

Detailed backend API documentation is available here:

[View API Documentation](docs/API_DOCUMENTATION.md)

## 🧑‍💻 Role System

| Role       | Permissions                                                                   |
| ---------- | ----------------------------------------------------------------------------- |
| Player     | Create/join teams, register for tournaments, submit results, view match rooms |
| Organizer  | Create/manage own tournaments and match rooms, review own tournament results  |
| Admin      | Manage users, teams, organizers, tournaments, match rooms, and results        |
| SuperAdmin | Full platform-level control                                                   |

---

## 🧠 Key Engineering Decisions

- Public signup creates only player accounts for security.
- Organizer role is granted through admin approval.
- Admin and superAdmin have platform-level control.
- Organizers can manage only their own tournaments, match rooms, and result submissions.
- Room passwords are visible only to eligible registered teams or authorized managers.
- Backend follows layered architecture: routes, controllers, services, models, middleware, and validators.
- Validation is handled with Zod before business logic execution.
- JWT is used for stateless authentication.
- CORS, Helmet, rate limiting, and MongoDB input sanitization are used for basic API security.

---

## 🏗️ System Architecture

Client (React + Vite)
|
| Axios + JWT Token
v
Backend API (Node.js + Express)
|
| Mongoose ODM
v
MongoDB Atlas

Backend Structure:
routes → validation middleware → controllers → services → models

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- CSS Modules

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt
- Zod Validation
- Helmet
- Express Rate Limit

---

## 📸 Screenshots

### Landing Page - Hero Section

![Landing Hero](docs/screenshots/landing-hero.png)

### Landing Page - Features

![Landing Features](docs/screenshots/landing-features.png)

### Landing Page - Footer

![Landing Footer](docs/screenshots/landing-footer.png)

### Login Page

![Login Page](docs/screenshots/login-page.png)

### Tournaments Page

![Tournaments Page](docs/screenshots/tournaments-page.png)

### Match Rooms Page

![Match Rooms Page](docs/screenshots/match-rooms-page.png)

### Manage Match Rooms Page

![Manage Match Rooms](docs/screenshots/manage-match-room-page.png)

### My Team Page

![My Team Page](docs/screenshots/my-team-page.png)

### Profile Page

![Profile Page](docs/screenshots/profile-page.png)

### Admin Dashboard

![Admin Dashboard](docs/screenshots/admin-dashboard.png)

---

## ⚙️ Environment Variables

Create `.env` file inside the `server` folder:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret

CLIENT_URL=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300

AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=20
```
