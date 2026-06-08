# Architecture.md — Automation Tools Repository (ATR)
## Full-Stack Architecture Reference for Vibe Coding / Antigravity

---

## 1. Project Overview

**Application Name:** Automation Tools Repository (ATR)  
**Purpose:** A centralized internal platform for managing, discovering, downloading, and viewing Python automation scripts (ZIP) and Power BI dashboards (PBIX/URL). Includes admin management, user authentication, download analytics, and versioned tool releases.

**Environment Boundary (Run Configuration):**
- Node: v26.3.0 | npm: 11.16.0
- Python: 3.12.6 (virtual environment: `venv/`)
- PostgreSQL: 17.5.2 (local, pgAdmin)
- OS: Windows/Linux local dev

---

## 2. High-Level System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                            │
│                  React + Vite + Tailwind CSS                      │
│              (Port 5173 - dev / Port 80 - prod)                  │
└─────────────────────────┬────────────────────────────────────────┘
                          │ HTTP/REST (Axios)
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND                               │
│                  Python 3.12.6 + Uvicorn                         │
│              (Port 8000 — API server)                            │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │ Auth Router │  │ Tools Router │  │  Dashboard Router       │ │
│  │ /api/auth   │  │ /api/tools   │  │  /api/dashboards        │ │
│  └─────────────┘  └──────────────┘  └─────────────────────────┘ │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │Users Router │  │Analytics Rtr │  │  Files Router           │ │
│  │ /api/users  │  │/api/analytics│  │  /api/files             │ │
│  └─────────────┘  └──────────────┘  └─────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              SQLAlchemy ORM (Async)                       │   │
│  │           + Alembic Migrations                            │   │
│  └─────────────────────────┬────────────────────────────────┘   │
└────────────────────────────┼─────────────────────────────────────┘
                             │ asyncpg
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    PostgreSQL 17.5.2                              │
│                  (localhost:5432)                                 │
│              Database: automation_tools_repo                     │
└──────────────────────────────────────────────────────────────────┘
                             │
                   Local File Storage
                   /uploads/tools/     ← ZIP files
                   /uploads/thumbnails/ ← Tool preview images
```

---

## 3. Frontend Architecture

### 3.1 Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Build Tool | Vite | Latest stable |
| Framework | React | 18.x |
| Styling | Tailwind CSS | 3.x |
| Icons | Lucide React | Latest |
| Charts | Recharts | Latest |
| HTTP Client | Axios | Latest |
| Routing | React Router DOM | v6 |
| State | React Context API + useReducer | Built-in |
| Forms | React Hook Form | Latest |
| Notifications | react-hot-toast | Latest |

### 3.2 Frontend Folder Structure
```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                   ← Axios instance + API call functions
│   │   ├── axiosInstance.js
│   │   ├── authApi.js
│   │   ├── toolsApi.js
│   │   ├── dashboardsApi.js
│   │   └── analyticsApi.js
│   ├── assets/                ← Static images, logos
│   ├── components/
│   │   ├── common/            ← Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   └── Pagination.jsx
│   │   ├── tools/
│   │   │   ├── ToolCard.jsx
│   │   │   ├── ToolDetail.jsx
│   │   │   ├── ToolUploadForm.jsx
│   │   │   ├── VersionHistory.jsx
│   │   │   └── DocumentationViewer.jsx
│   │   ├── dashboards/
│   │   │   ├── DashboardCard.jsx
│   │   │   ├── DashboardViewer.jsx
│   │   │   └── DashboardForm.jsx
│   │   ├── admin/
│   │   │   ├── AdminToolTable.jsx
│   │   │   ├── UserManagementTable.jsx
│   │   │   ├── AnalyticsChart.jsx
│   │   │   └── DownloadLog.jsx
│   │   └── auth/
│   │       ├── LoginForm.jsx
│   │       └── RegisterForm.jsx
│   ├── context/
│   │   ├── AuthContext.jsx    ← JWT auth state, user role
│   │   └── ThemeContext.jsx   ← (light blue theme constants)
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useTools.js
│   │   └── useDebounce.js
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── HomePage.jsx        ← Main tool/dashboard grid
│   │   ├── ToolDetailPage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── ManageTools.jsx
│   │       ├── ManageUsers.jsx
│   │       └── AnalyticsPage.jsx
│   ├── utils/
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### 3.3 Color Theme (Light Blue)
```js
// tailwind.config.js custom colors
colors: {
  primary: {
    50:  '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  surface: '#f8fafc',
  card:    '#ffffff',
  border:  '#e2e8f0',
}
```

### 3.4 Route Map
```
/                   → HomePage (redirect to /login if not auth)
/login              → LoginPage
/register           → RegisterPage
/tools              → Tool listing grid
/tools/:id          → ToolDetailPage (docs, download, versions)
/dashboards         → Dashboard listing grid
/dashboards/:id     → DashboardViewer (embedded Power BI / iframe)
/admin              → AdminDashboard (admin only)
/admin/tools        → ManageTools
/admin/users        → ManageUsers
/admin/analytics    → AnalyticsPage
```

---

## 4. Backend Architecture

### 4.1 Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | FastAPI | 0.111.x |
| ASGI Server | Uvicorn | Latest |
| ORM | SQLAlchemy (async) | 2.x |
| DB Driver | asyncpg | Latest |
| Migrations | Alembic | Latest |
| Auth | python-jose (JWT) | Latest |
| Password Hash | passlib + bcrypt | Latest |
| File Handling | aiofiles | Latest |
| Validation | Pydantic v2 | Latest |
| CORS | FastAPI CORSMiddleware | Built-in |

### 4.2 Backend Folder Structure
```
backend/
├── venv/                      ← Python virtual environment (git ignored)
├── app/
│   ├── __init__.py
│   ├── main.py                ← FastAPI app factory, middleware, routers
│   ├── config.py              ← Settings (env vars, DB URL, JWT secret)
│   ├── database.py            ← AsyncEngine, SessionLocal, Base
│   ├── dependencies.py        ← get_db, get_current_user, require_admin
│   ├── models/                ← SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── tool.py
│   │   ├── tool_version.py
│   │   ├── dashboard.py
│   │   ├── download_log.py
│   │   └── category.py
│   ├── schemas/               ← Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── tool.py
│   │   ├── dashboard.py
│   │   └── analytics.py
│   ├── routers/               ← FastAPI routers
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── tools.py
│   │   ├── dashboards.py
│   │   ├── users.py
│   │   ├── analytics.py
│   │   └── files.py
│   ├── services/              ← Business logic layer
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── tool_service.py
│   │   ├── dashboard_service.py
│   │   └── analytics_service.py
│   └── utils/
│       ├── __init__.py
│       ├── security.py        ← JWT encode/decode, password hash
│       └── file_handler.py    ← ZIP/file save, delete
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/              ← Auto-generated migration files
├── uploads/
│   ├── tools/                 ← Stored ZIP files
│   └── thumbnails/            ← Tool/dashboard thumbnails
├── .env
├── alembic.ini
└── requirements.txt
```

### 4.3 API Endpoints
```
AUTH
  POST   /api/auth/register          → Register new user
  POST   /api/auth/login             → Login, returns JWT
  GET    /api/auth/me                → Current user info

TOOLS
  GET    /api/tools                  → List tools (filter, search, paginate)
  GET    /api/tools/:id              → Tool detail + versions + docs
  POST   /api/tools                  → [ADMIN] Create tool + upload ZIP
  PUT    /api/tools/:id              → [ADMIN] Update tool metadata
  DELETE /api/tools/:id              → [ADMIN] Delete tool
  POST   /api/tools/:id/version      → [ADMIN] Upload new version ZIP
  GET    /api/tools/:id/download     → Download latest ZIP (logs event)
  GET    /api/tools/:id/versions/:v/download → Download specific version

DASHBOARDS
  GET    /api/dashboards             → List dashboards
  GET    /api/dashboards/:id         → Dashboard detail + embed URL
  POST   /api/dashboards             → [ADMIN] Add dashboard
  PUT    /api/dashboards/:id         → [ADMIN] Update
  DELETE /api/dashboards/:id         → [ADMIN] Delete

USERS (ADMIN)
  GET    /api/users                  → List all users
  PUT    /api/users/:id/role         → Change user role
  DELETE /api/users/:id              → Delete user
  GET    /api/users/:id/downloads    → User download history

ANALYTICS (ADMIN)
  GET    /api/analytics/overview     → Total downloads, users, tools counts
  GET    /api/analytics/downloads    → Download trends (daily/weekly/monthly)
  GET    /api/analytics/top-tools    → Most downloaded tools
  GET    /api/analytics/user-activity → Active users stats

FILES
  GET    /api/files/uploads/:filename → Serve static uploaded files (thumbnail)
```

---

## 5. Database Architecture

### 5.1 PostgreSQL Configuration
```
Host:     localhost
Port:     5432
Database: automation_tools_repo
User:     postgres (or custom user)
Password: (set in .env)
```

### 5.2 Entity Relationship Diagram (ERD)

```
┌──────────────────┐         ┌──────────────────────┐
│     users        │         │      categories      │
├──────────────────┤         ├──────────────────────┤
│ id (PK, UUID)    │         │ id (PK, UUID)        │
│ email (UNIQUE)   │         │ name (UNIQUE)        │
│ password_hash    │         │ description          │
│ full_name        │         │ icon                 │
│ role (enum)      │         │ created_at           │
│ is_active        │         └──────────┬───────────┘
│ created_at       │                    │ FK
│ last_login       │                    │
└────────┬─────────┘         ┌──────────▼───────────┐
         │                   │        tools         │
         │ FK(created_by)    ├──────────────────────┤
         ├──────────────────▶│ id (PK, UUID)        │
         │                   │ name                 │
         │                   │ slug (UNIQUE)        │
         │                   │ description          │
         │                   │ long_description     │
         │                   │ category_id (FK)     │
         │                   │ created_by (FK→users)│
         │                   │ thumbnail_path       │
         │                   │ tags (ARRAY TEXT)    │
         │                   │ is_active            │
         │                   │ is_featured          │
         │                   │ dependencies (JSONB) │
         │                   │ documentation (TEXT) │
         │                   │ created_at           │
         │                   │ updated_at           │
         │                   └──────────┬───────────┘
         │                              │ 1:N
         │                   ┌──────────▼───────────┐
         │                   │    tool_versions     │
         │                   ├──────────────────────┤
         │                   │ id (PK, UUID)        │
         │                   │ tool_id (FK→tools)   │
         │                   │ version_number       │
         │                   │ file_path            │
         │                   │ file_size_bytes      │
         │                   │ release_notes        │
         │                   │ is_latest            │
         │                   │ uploaded_by (FK)     │
         │                   │ created_at           │
         │                   └──────────────────────┘

┌──────────────────────┐      ┌──────────────────────┐
│      dashboards      │      │    download_logs     │
├──────────────────────┤      ├──────────────────────┤
│ id (PK, UUID)        │      │ id (PK, UUID)        │
│ name                 │      │ user_id (FK→users)   │
│ description          │      │ tool_id (FK→tools)   │
│ embed_url            │      │ tool_version_id (FK) │
│ thumbnail_path       │      │ downloaded_at        │
│ category_id (FK)     │      │ ip_address           │
│ created_by (FK)      │      │ user_agent           │
│ is_active            │      └──────────────────────┘
│ is_featured          │
│ tags (ARRAY TEXT)    │
│ created_at           │
│ updated_at           │
└──────────────────────┘
```

### 5.3 Enums
```sql
CREATE TYPE user_role AS ENUM ('user', 'admin');
```

### 5.4 Key Indexes
```sql
CREATE INDEX idx_tools_category ON tools(category_id);
CREATE INDEX idx_tools_tags ON tools USING GIN(tags);
CREATE INDEX idx_tool_versions_tool ON tool_versions(tool_id);
CREATE INDEX idx_download_logs_user ON download_logs(user_id);
CREATE INDEX idx_download_logs_tool ON download_logs(tool_id);
CREATE INDEX idx_download_logs_date ON download_logs(downloaded_at);
CREATE INDEX idx_users_email ON users(email);
```

---

## 6. Authentication Architecture

### 6.1 Flow
```
Register → POST /api/auth/register → hash password (bcrypt) → insert users table → 201
Login    → POST /api/auth/login    → verify password → sign JWT (HS256, 30d expiry) → return token
Request  → Header: Authorization: Bearer <token> → FastAPI dependency verifies → inject user
Admin    → require_admin dependency checks user.role == 'admin' → 403 if not
```

### 6.2 JWT Payload
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "user|admin",
  "exp": 1234567890
}
```

### 6.3 Default Admin Seed
```
Email:    admin@atr.internal
Password: Admin@123  (change in production)
Role:     admin
```

---

## 7. File Storage Architecture

```
backend/uploads/
├── tools/
│   └── {tool_id}/
│       ├── v1.0.0_{original_filename}.zip
│       ├── v1.1.0_{original_filename}.zip
│       └── v2.0.0_{original_filename}.zip
└── thumbnails/
    ├── tool_{tool_id}.png
    └── dash_{dashboard_id}.png
```

**Rules:**
- Only `.zip` files accepted for tool uploads
- Max ZIP file size: 100 MB
- Thumbnail images: PNG/JPG, max 2 MB
- Served via `/api/files/uploads/` static route

---

## 8. Security Architecture

| Concern | Approach |
|---------|----------|
| Password storage | bcrypt hashing via passlib |
| Auth token | JWT (HS256), stored in localStorage |
| File type validation | Extension + magic bytes check |
| CORS | Allow only frontend origin |
| Admin access | Role-based dependency injection |
| SQL injection | SQLAlchemy ORM (parameterized queries) |
| File path traversal | Sanitize filename with `secure_filename` |

---

## 9. Environment Variables

### Backend `.env`
```
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/automation_tools_repo
SECRET_KEY=your-super-secret-jwt-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE_MB=100
ADMIN_EMAIL=admin@atr.internal
ADMIN_PASSWORD=Admin@123
```

### Frontend `.env`
```
VITE_API_BASE_URL=http://localhost:8000
```

---

## 10. Deployment Architecture (Local Dev)

```
Terminal 1 (Backend):
  cd backend
  .\venv\Scripts\activate   (Windows) / source venv/bin/activate (Linux)
  uvicorn app.main:app --reload --port 8000

Terminal 2 (Frontend):
  cd frontend
  npm run dev
  → http://localhost:5173

pgAdmin:
  Host: localhost | Port: 5432
  Database: automation_tools_repo
```

---

*Last updated: Architecture v1.0 — Automation Tools Repository*
