# Esports Battle

> Full-Stack Esports Tournament Management Platform

A full-stack esports tournament management platform built to manage players, teams, tournaments, matches, results, organizer applications, and administrative operations through a role-based system.

## Live Project

- **Frontend:** https://esports-battle-seven.vercel.app
- **Backend API:** https://3.111.103.45
- **GitHub:** https://github.com/yash-yadav1804/Esports-Battle

---

## Overview

Esports Battle is a web-based tournament management platform designed to simplify the complete esports tournament lifecycle.

Players can register, create and join teams, participate in tournaments, manage match rooms, submit results, view leaderboards, and track tournament history.

Organizers can create and manage tournaments, organize matches, review submissions, and manage tournament operations.

Administrators manage users, teams, tournaments, organizer applications, match rooms, and platform-level operations.

---

## Features

### Player

- User registration and login
- Role-based access
- Player profile management
- Create and manage teams
- Join teams through requests
- Team request management
- Browse tournaments
- Tournament registration
- View tournament details
- View match rooms
- Submit match results
- View leaderboards
- Tournament history
- Notifications
- Submission history

### Organizer

- Organizer application
- Tournament creation
- Tournament management
- Match room creation
- Match management
- Result submission
- Pending result management
- Tournament operations dashboard

### Admin

- Admin dashboard
- User management
- Team management
- Tournament management
- Match room management
- Organizer application management
- Pending result management
- Platform-level administration

### Super Admin

- Platform-level administrative access
- Administrative user management
- Full system management capabilities

---

## Role Workflow

```text
                         Esports Battle
                              |
                +-------------+-------------+
                |             |             |
             Players      Organizers      Admins
                |             |             |
                v             v             v
             Teams       Tournaments    User Management
                |             |          Team Management
                |             |          Tournament Management
                v             v          Match Management
              Matches ------> Results
                |
                v
           Leaderboards
                |
                v
        Tournament History
```

---

## Technology Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- Pydantic
- Uvicorn

### Frontend

- React 19
- Vite
- JavaScript
- React Router
- Axios
- CSS Modules

### DevOps & Deployment

- Docker
- Docker Compose
- Amazon EC2
- Amazon ECR
- Nginx
- Let's Encrypt
- Certbot
- Vercel
- GitHub

---

## Architecture

```text
                         Users
                           |
                           v
                    React Frontend
                           |
                           | HTTPS
                           v
                    Nginx Reverse Proxy
                           |
                           v
                    FastAPI Backend
                           |
              +------------+------------+
              |                         |
              v                         v
        SQLAlchemy ORM             API Services
              |
              v
          PostgreSQL
```

---

## Backend Architecture

The backend follows a layered architecture to keep API handling, business logic, database operations, authentication, and configuration organized.

```text
backend/
│
├── app/
│   ├── api/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   └── main.py
│
├── alembic/
│
├── scripts/
│
├── Dockerfile
├── docker-compose.prod.yml
├── requirements.txt
└── .env
```

### Main Backend Responsibilities

- REST API development
- Authentication
- Authorization
- Role management
- User management
- Team management
- Tournament management
- Match management
- Result management
- Database operations
- Migrations
- Validation
- Error handling

---

## Frontend Architecture

```text
frontend/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── context/
│   ├── hooks/
│   ├── routes/
│   ├── assets/
│   ├── App.jsx
│   └── main.jsx
│
├── public/
├── package.json
├── vite.config.js
└── vercel.json
```

The React frontend communicates with the FastAPI backend through REST APIs using Axios.

---

## Authentication & Authorization

The platform uses role-based authorization.

Supported roles:

```text
PLAYER
ORGANIZER
ADMIN
SUPER_ADMIN
```

Access to protected functionality is controlled according to the authenticated user's role.

Example:

```text
PLAYER
  |
  +-- Teams
  +-- Tournaments
  +-- Matches
  +-- Results
  +-- Leaderboards
  +-- Profile

ORGANIZER
  |
  +-- Tournaments
  +-- Matches
  +-- Results

ADMIN
  |
  +-- Users
  +-- Teams
  +-- Tournaments
  +-- Match Rooms
  +-- Organizer Requests
  +-- Results

SUPER_ADMIN
  |
  +-- Full Platform Administration
```

---

## Database

PostgreSQL is used as the primary relational database.

SQLAlchemy is used as the ORM layer.

Alembic is used for database schema migrations.

Migration workflow:

```bash
alembic revision --autogenerate -m "migration message"
alembic upgrade head
```

The production database is running inside the Docker Compose environment on the EC2 server.

---

## Docker

The backend production environment uses Docker Compose.

Main services:

```text
backend-api
    |
    v
FastAPI Application

backend-db
    |
    v
PostgreSQL
```

The PostgreSQL container includes a health check so the API can depend on the database being available.

---

## Production Deployment

The production architecture is hosted on AWS and Vercel.

```text
                    Internet
                       |
             +---------+---------+
             |                   |
             v                   v
          Vercel              AWS EC2
             |                   |
             |              Elastic IP
             |                   |
             |                 Nginx
             |                   |
             |             HTTPS / SSL
             |                   |
             |                   v
             |             FastAPI API
             |                   |
             |              PostgreSQL
             |
             v
        React Frontend
```

### Frontend

The React/Vite frontend is deployed on Vercel.

Production frontend:

```text
https://esports-battle-seven.vercel.app
```

### Backend

The FastAPI backend is deployed on Amazon EC2.

Production backend:

```text
https://3.111.103.45
```

### Reverse Proxy

Nginx handles:

- HTTP requests
- HTTPS requests
- SSL termination
- Reverse proxying
- API forwarding

### SSL

HTTPS is configured using:

- Let's Encrypt
- Certbot

---

## Local Development

### Clone Repository

```bash
git clone https://github.com/yash-yadav1804/Esports-Battle.git
cd Esports-Battle
```

---

## Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

Backend will be available at:

```text
http://127.0.0.1:8000
```

---

## Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## Environment Variables

### Frontend

Local development:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Production:

```env
VITE_API_URL=https://3.111.103.45/api
```

### Backend

Backend environment variables should contain the required database, authentication, application, and deployment configuration.

Do not commit `.env` files or secrets to GitHub.

---

## API

The FastAPI application exposes REST endpoints for:

- Authentication
- Users
- Teams
- Tournaments
- Matches
- Results
- Leaderboards
- Notifications
- Organizer applications
- Administrative operations

FastAPI automatically provides API documentation.

Swagger UI:

```text
/api/docs
```

OpenAPI specification:

```text
/api/openapi.json
```

---

## Project Structure

```text
Esports-Battle/
│
├── backend/
│   ├── app/
│   ├── alembic/
│   ├── scripts/
│   ├── Dockerfile
│   ├── docker-compose.prod.yml
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
└── README.md
```

---

## Git Workflow

Create a feature branch:

```bash
git checkout -b feature/your-feature
```

Check changes:

```bash
git status
```

Add changes:

```bash
git add .
```

Commit:

```bash
git commit -m "Add your feature"
```

Push the branch:

```bash
git push origin feature/your-feature
```

Merge changes into `main` after review and testing.

---

## Deployment Workflow

### Backend

```text
Code
  |
  v
GitHub
  |
  v
Docker Build
  |
  v
Amazon ECR
  |
  v
Amazon EC2
  |
  v
Docker Compose
  |
  v
FastAPI + PostgreSQL
```

### Frontend

```text
Code
  |
  v
GitHub
  |
  v
Vercel
  |
  v
Production React Application
```

---

## Security

The project follows common application security practices including:

- Environment-based configuration
- Secret management through environment variables
- Password hashing
- Role-based authorization
- Protected API routes
- HTTPS in production
- Database access through SQLAlchemy
- Input validation using Pydantic
- `.env` files excluded from Git
- Restricted EC2 SSH access
- Nginx reverse proxy
- SSL certificate management

---

## Future Improvements

Potential future enhancements include:

- Online tournament payments
- Real-time match updates
- WebSocket-based notifications
- Advanced tournament brackets
- Automated deployment pipelines
- Monitoring and logging
- Cloud-based database deployment
- Redis caching
- Background task processing
- Advanced analytics
- Mobile application
- Improved tournament discovery
- Automated result verification

---

## Author

### Yash Yadav

**Python Full Stack Developer**

Python • FastAPI • React • PostgreSQL • SQLAlchemy • Docker • AWS

### Profiles

- GitHub: https://github.com/yash-yadav1804
- LinkedIn: https://www.linkedin.com/
- Live Project: https://esports-battle-seven.vercel.app

---

## License

This project is developed for learning, development, and portfolio purposes.
