# Automation Tools Repository (ATR)

ATR is a centralized internal platform designed for the discoverability, management, and execution of Python automation scripts (packaged as ZIP archives) and Power BI reports. It features robust user authentication, script version control, download auditing, system analytics, and administrative management tools.

---

## 🛠️ Prerequisites

To run this project locally, ensure you have the following software installed:

*   **Operating System**: Windows / Linux / macOS
*   **Node.js**: v26.3.0 or higher (npm 11.16.0+)
*   **Python**: 3.12.6 or higher (actual test environment: 3.13.1)
*   **PostgreSQL**: 17.5.2 or higher (running locally on port 5432)

---

## 📂 Monorepo Structure

```
autorepo/
├── frontend/     → React 19.2 (Vite 8) application
├── backend/      → FastAPI (Python 3.13) application
└── README.md     → Project documentation and setup guide
```

---

## 🚀 Quick Start Guide

### 1. Database Setup

1.  Ensure PostgreSQL is running locally on port 5432.
2.  Log in to `psql` or pgAdmin using the username `postgres`.
3.  Create the application database:
    ```sql
    CREATE DATABASE automation_tools_repo;
    ```

### 2. Backend Installation & Startup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create and activate a Python virtual environment:
    ```powershell
    python -m venv venv
    .\venv\Scripts\activate
    ```
3.  Install all required dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure the environment variables in `backend/.env` (see reference below).
5.  Run database schema migrations to create all tables:
    ```bash
    alembic upgrade head
    ```
6.  Seed the database with default categories, sample tools, and users:
    ```bash
    python seed.py
    ```
7.  Start the FastAPI development server:
    ```bash
    uvicorn app.main:app --reload --port 8000
    ```
    The API documentation will be available at: **[http://localhost:8000/docs](http://localhost:8000/docs)** (Swagger UI).

### 3. Frontend Installation & Startup

1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install npm packages:
    ```bash
    npm install
    ```
3.  Configure the environment variable in `frontend/.env` (see reference below).
4.  Start the Vite development server:
    ```bash
    npm run dev
    ```
    The application will run locally at: **[http://localhost:5173](http://localhost:5173)**.

---

## 🔑 Default Credentials

The database seeder (`seed.py`) populates the system with two default accounts:

### 1. Administrator Account
*   **Email**: `admin@atr.internal`
*   **Password**: `Admin@123`
*   **Role**: `admin`

### 2. Standard User Account
*   **Email**: `testuser@example.com`
*   **Password**: `TestPass123`
*   **Role**: `user`

---

## ⚙️ Environment Variables Reference

### Backend Configuration (`backend/.env`)
Create this file in the `backend/` directory:
```env
DATABASE_URL=postgresql+asyncpg://postgres:badri%40123@localhost:5432/automation_tools_repo
SECRET_KEY=c3629e46a782bb19782bbccf0122956cf018a38a7281d77a02298ff2a0efc609
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE_MB=50
```

### Frontend Configuration (`frontend/.env`)
Create this file in the `frontend/` directory:
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🔒 Security Implementations

*   **ZIP Validation**: Verifies both file extension `.zip` and PK magic headers (`PK\x03\x04`) during uploads.
*   **Path Traversal Prevention**: Filenames are sanitized of special characters (`..`, `/`, `\`) before storing on disk. Files are served via FastAPI endpoints with traversal checks rather than raw static routes.
*   **JWT Sessions**: Access tokens are stored temporarily in client memory/state, with the signature stored in `localStorage`. Tokens are cleared automatically on logout or on any `401 Unauthorized` response.
*   **Role-Based Security**: Administrative endpoints require the `require_admin` dependency server-side, and administrative layouts are guarded client-side via `<AdminRoute />`.
