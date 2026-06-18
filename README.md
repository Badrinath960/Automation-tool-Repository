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

This step-by-step walkthrough will guide you through setting up the local database, running backend migrations, and starting up both servers.

---

### 1. Database Setup (via pgAdmin UI)

Follow these visual steps to create your database using the pgAdmin (PostgreSQL administration platform) graphical interface:

1. **Launch pgAdmin**: Start pgAdmin (the app installed with PostgreSQL).
2. **Authenticate with Server**:
   - In the left sidebar list (Browser tree), click on the arrow next to **Servers**.
   - If prompted, type in your PostgreSQL system password (the password you selected during PostgreSQL installation, e.g., `Admin@123` or `postgres`) to log in.
3. **Create the Database**:
   - Right-click on **Databases** under your active server connection.
   - Select **Create** ➔ **Database...** from the menu.
   - In the popup window that appears, type the following name in the **Database** input:
     ```text
     automation_tools_repo
     ```
   - Click the blue **Save** button at the bottom.
4. **Result**: Your empty `automation_tools_repo` database is now running locally and ready for tables to be created!

---

### 2. Backend Installation & Running Database Migrations

Next, we install the backend dependencies, configure the credentials file, and run database migrations. Migrations automatically create the tables inside your new PostgreSQL database.

1. **Open your Terminal (or PowerShell)** and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. **Create a Virtual Environment**:
   This keeps the python dependencies isolated for this project:
   ```powershell
   python -m venv venv
   ```
3. **Activate the Virtual Environment**:
   * **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\activate
     ```
     *(You will see `(venv)` appear at the start of your command prompt)*
   * **macOS / Linux (Terminal)**:
     ```bash
     source venv/bin/activate
     ```
4. **Install Python Packages**:
   ```bash
   pip install -r requirements.txt
   ```
5. **Set Up the Environment Settings File (`.env`)**:
   - Create a new file in the `backend/` folder and name it exactly `.env`.
   - Copy and paste the configuration below, making sure you replace the password (`badri%40123`) in the connection string with your actual local PostgreSQL password:
     ```env
     DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD_HERE@localhost:5432/automation_tools_repo
     SECRET_KEY=c3629e46a782bb19782bbccf0122956cf018a38a7281d77a02298ff2a0efc609
     ALGORITHM=HS256
     ACCESS_TOKEN_EXPIRE_MINUTES=60
     UPLOAD_DIR=uploads
     MAX_UPLOAD_SIZE_MB=50
     ```
     *(Note: If your password contains special characters like `@`, you must url-encode them: `@` becomes `%40`, etc.)*
6. **Run Database Migrations**:
   Run the database schema builder command. This reads the database migrations folder and builds all 7 application tables in PostgreSQL:
   ```bash
   alembic upgrade head
   ```
   * **How to Verify in pgAdmin**:
     - In the pgAdmin Browser tree, expand: **Databases** ➔ **automation_tools_repo** ➔ **Schemas** ➔ **public** ➔ **Tables**.
     - Right-click **Tables** and choose **Refresh** (or click it and press `F5`).
     - You should see the newly created tables listed: `alembic_version`, `categories`, `dashboards`, `download_logs`, `tool_versions`, `tools`, and `users`.
7. **Seed the Database**:
   Populate the tables with system categories, sample scripts, and default logins:
   ```bash
   python seed.py
   ```
   * **How to View Seeded Data in pgAdmin**:
     - Right-click on the `users` or `categories` table.
     - Choose **View/Edit Data** ➔ **All Rows**.
     - You will see the default admin account (`admin@atr.internal`) and categories in the data window.
8. **Start Backend Server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   * Your server is running at: `http://localhost:8000`.
   * Open the interactive Swagger API documentation at: **[http://localhost:8000/docs](http://localhost:8000/docs)** to test the endpoints directly!

---

### 3. Frontend Installation & Startup

Now, we will start the React user interface.

1. **Open a new terminal window** (keep the backend server terminal running) and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. **Install Frontend Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Frontend Environment Variable (`.env`)**:
   - Create a file named `.env` in the `frontend/` folder.
   - Paste the following API connection URL inside it:
     ```env
     VITE_API_BASE_URL=http://localhost:8000
     ```
4. **Start Vite Development Server**:
   ```bash
   npm run dev
   ```
5. **Open Application**:
   Open your browser and navigate to: **[http://localhost:5173](http://localhost:5173)**. Log in with the default credentials shown below!

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
