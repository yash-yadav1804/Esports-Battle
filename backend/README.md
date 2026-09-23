# Esports Battle — FastAPI + PostgreSQL Backend

This backend replaces the original Express/Mongoose backend while preserving the existing React frontend UI and API paths wherever practical.

## Stack

- FastAPI
- PostgreSQL
- SQLAlchemy 2.x
- Alembic
- JWT
- Argon2 password hashing
- Docker / Docker Compose

## Local development

### 1. Create PostgreSQL database

```sql
CREATE DATABASE esports_battle;
```

### 2. Configure environment

Copy `.env.example` to `.env` and set your PostgreSQL password and JWT secret.

Example:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/esports_battle
```

### 3. Install

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 4. Run migrations

```powershell
alembic upgrade head
```

### 5. Start API

```powershell
uvicorn app.main:app --reload --port 8000
```

Swagger: http://localhost:8000/docs

Health: http://localhost:8000/health

## Docker

```powershell
docker compose up --build
```

The existing frontend should use:

```env
VITE_API_URL=http://localhost:8000/api
```

## API compatibility

The backend intentionally keeps routes such as `/api/auth/login`, `/api/tournaments`, `/api/teams`, `/api/matchrooms`, `/api/result-submissions`, `/api/leaderboard`, etc. so the existing UI needs minimal integration changes.
