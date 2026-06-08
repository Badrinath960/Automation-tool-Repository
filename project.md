# Project.md — Automation Tools Repository (ATR)
## Complete Project Reference for Vibe Coding / Antigravity

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Project Name** | Automation Tools Repository (ATR) |
| **Type** | Internal Full-Stack Web Application |
| **Theme** | Light Blue (`sky`/`blue` palette) |
| **Purpose** | Central hub to manage, search, download Python automation tools (ZIP) and view Power BI dashboards |
| **Users** | Internal team members + Admins |
| **Auth Mode** | Email + Password only (no OTP, demo-grade) |

---

## 2. Development Environment

### 2.1 Runtime Versions (Hard Boundary)
```
Node.js:   v26.3.0
npm:       11.16.0
Python:    3.12.6
PostgreSQL: 17.5.2
pgAdmin:   Local install
```

### 2.2 Virtual Environment Setup
```bash
# From project root
python -m venv backend/venv

# Activate (Windows)
backend\venv\Scripts\activate

# Activate (Linux/Mac)
source backend/venv/bin/activate

# Install all backend dependencies
pip install -r backend/requirements.txt
```

### 2.3 Frontend Setup
```bash
cd frontend
npm install
npm run dev      # → http://localhost:5173
```

### 2.4 Backend Setup
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### 2.5 Database Setup
```bash
# Create database in pgAdmin or psql
CREATE DATABASE automation_tools_repo;

# Run Alembic migrations
cd backend
alembic upgrade head

# Seed admin user
python seed.py
```

---

## 3. Full Tech Stack Reference

### 3.1 Frontend Dependencies (`package.json`)
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.24.0",
    "axios": "^1.7.2",
    "recharts": "^2.12.7",
    "lucide-react": "^0.400.0",
    "react-hook-form": "^7.52.0",
    "react-hot-toast": "^2.4.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.4",
    "vite": "^5.3.3"
  }
}
```

### 3.2 Backend Dependencies (`requirements.txt`)
```
fastapi==0.111.1
uvicorn[standard]==0.30.1
sqlalchemy[asyncio]==2.0.31
asyncpg==0.29.0
alembic==1.13.2
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
aiofiles==23.2.1
pydantic==2.8.2
pydantic-settings==2.3.4
python-dotenv==1.0.1
email-validator==2.2.0
psycopg2-binary==2.9.9
```

### 3.3 Vite Config (`vite.config.js`)
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

### 3.4 Tailwind Config (`tailwind.config.js`)
```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: []
}
```

---

## 4. Feature Specifications

### 4.1 User-Facing Features

#### Global Search & Filter
- Real-time search across: tool name, description, tags, category
- Filter by: Category, Type (Tool/Dashboard), Tags
- Sort by: Newest, Most Downloaded, Name A-Z
- Debounced input (300ms) to avoid excessive API calls
- URL-synced query params for shareable filtered views

#### Tool Listing (Home / /tools)
- Card grid layout (responsive: 1→2→3 columns)
- Each card shows: thumbnail, name, category badge, version tag, description snippet, download count, download button
- "Featured" badge for highlighted tools
- Skeleton loading state

#### Tool Detail Page (`/tools/:id`)
- Full name, description, category
- Tabs: Overview | Documentation | Version History | Dependencies
- **Overview tab:** Long description, tags, created by, last updated
- **Documentation tab:** Markdown-rendered step-by-step usage guide
- **Version History tab:** All versions with release notes, date, file size; download any version
- **Dependencies tab:** List of Python packages required
- Download button (latest version ZIP)
- Admin-only: Edit, Delete, Upload New Version buttons visible

#### Dashboard Listing (`/dashboards`)
- Card grid layout
- Each card: thumbnail, name, description, "View" button
- Filter by category

#### Dashboard Viewer (`/dashboards/:id`)
- Embedded iframe showing Power BI embed URL
- Full-screen toggle
- Title and description panel beside/below iframe

### 4.2 Admin Features

#### Admin Dashboard (`/admin`)
- KPI Cards: Total Tools, Total Dashboards, Total Users, Total Downloads
- Line chart: Download trend (last 30 days) — Recharts
- Bar chart: Top 10 most downloaded tools — Recharts
- Pie chart: Downloads by category — Recharts
- Recent download log table (last 20 entries)

#### Manage Tools (`/admin/tools`)
- Full table: Name, Category, Version, Downloads, Status, Actions
- Actions: Edit metadata, Upload new version, Toggle active/inactive, Delete
- Add new tool button → Modal form with:
  - Tool name, slug (auto-generated), description, long description
  - Category selector
  - Tags (comma-separated input)
  - Dependencies (Python package names, one per line)
  - Documentation textarea (Markdown supported)
  - Thumbnail upload (image)
  - ZIP file upload (required)
  - Version number input
  - Release notes textarea
  - Is Featured toggle

#### Upload New Version Modal
- Tool name (read-only)
- Version number (e.g. v2.0.0)
- Release notes
- New ZIP file upload
- Previous versions shown with dates

#### Manage Users (`/admin/users`)
- Table: Name, Email, Role, Status, Registered Date, Last Login, Downloads Count
- Actions: Promote to Admin, Deactivate, Delete
- Cannot delete or demote self (guard)

#### Analytics Page (`/admin/analytics`)
- Date range picker (Last 7d / 30d / 90d / Custom)
- Download trend line chart
- Per-tool download bar chart
- User registration trend
- Export button: Download CSV of download logs

### 4.3 Authentication Features
- Register: Full name, email, password (min 8 chars), confirm password
- Login: Email + password, remember session (JWT in localStorage)
- Logout: Clear token, redirect to /login
- Route protection: PrivateRoute (any auth) + AdminRoute (admin role only)
- Auth state persists on page refresh via token revalidation

---

## 5. Database Models (Full Detail)

### 5.1 users
```
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
email           VARCHAR(255) UNIQUE NOT NULL
password_hash   VARCHAR(255) NOT NULL
full_name       VARCHAR(255) NOT NULL
role            user_role DEFAULT 'user'
is_active       BOOLEAN DEFAULT TRUE
created_at      TIMESTAMP DEFAULT NOW()
last_login      TIMESTAMP
```

### 5.2 categories
```
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
name            VARCHAR(100) UNIQUE NOT NULL
description     TEXT
icon            VARCHAR(50)          ← Lucide icon name string
created_at      TIMESTAMP DEFAULT NOW()
```

### 5.3 tools
```
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
name            VARCHAR(255) NOT NULL
slug            VARCHAR(255) UNIQUE NOT NULL
description     VARCHAR(500)
long_description TEXT
category_id     UUID FK → categories.id
created_by      UUID FK → users.id
thumbnail_path  VARCHAR(500)
tags            TEXT[]               ← PostgreSQL array
is_active       BOOLEAN DEFAULT TRUE
is_featured     BOOLEAN DEFAULT FALSE
dependencies    JSONB                ← {"packages": ["pandas", "openpyxl"]}
documentation   TEXT                 ← Markdown string
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP
```

### 5.4 tool_versions
```
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tool_id         UUID FK → tools.id ON DELETE CASCADE
version_number  VARCHAR(50) NOT NULL     ← "v1.0.0"
file_path       VARCHAR(500) NOT NULL
file_size_bytes BIGINT
release_notes   TEXT
is_latest       BOOLEAN DEFAULT FALSE
uploaded_by     UUID FK → users.id
created_at      TIMESTAMP DEFAULT NOW()

UNIQUE(tool_id, version_number)
```

### 5.5 dashboards
```
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
name            VARCHAR(255) NOT NULL
description     TEXT
embed_url       VARCHAR(1000) NOT NULL   ← Power BI embed URL
thumbnail_path  VARCHAR(500)
category_id     UUID FK → categories.id
created_by      UUID FK → users.id
is_active       BOOLEAN DEFAULT TRUE
is_featured     BOOLEAN DEFAULT FALSE
tags            TEXT[]
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP
```

### 5.6 download_logs
```
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID FK → users.id
tool_id         UUID FK → tools.id
tool_version_id UUID FK → tool_versions.id
downloaded_at   TIMESTAMP DEFAULT NOW()
ip_address      VARCHAR(45)
user_agent      TEXT
```

---

## 6. UI/UX Component Specs

### 6.1 Navbar
- Logo + "ATR" text (left)
- Global search bar (center, full-width on desktop)
- User avatar + name dropdown (right)
- Admin badge if role=admin
- Responsive hamburger menu (mobile)

### 6.2 Sidebar (Admin only)
- Links: Dashboard, Tools, Dashboards, Users, Analytics
- Collapsible on mobile
- Active link highlight with primary-600 color

### 6.3 Tool Card Design
```
┌─────────────────────────────┐
│  [Thumbnail 16:9 image]     │
│  [FEATURED badge if set]    │
├─────────────────────────────┤
│  Tool Name              v2.0│
│  [Category Badge]           │
│  Short description...       │
│  Tags: [tag1] [tag2]        │
│  ─────────────────────────  │
│  ↓ 142 downloads  [↓ Download] │
└─────────────────────────────┘
```

### 6.4 Analytics Charts (Recharts)
- `<LineChart>` — Download trends
- `<BarChart>` — Top tools by downloads
- `<PieChart>` — Downloads by category
- All charts: responsive, primary blue color palette, tooltips, legend

---

## 7. Seed Data

### 7.1 Default Categories
```
1. Data Processing    (icon: "database")
2. Automation         (icon: "zap")
3. Reporting          (icon: "file-text")
4. Integration        (icon: "link")
5. Analytics          (icon: "bar-chart-2")
```

### 7.2 Default Admin Account
```
Full Name: System Admin
Email:     admin@atr.internal
Password:  Admin@123
Role:      admin
```

### 7.3 Sample Tools (for demo)
```
Tool 1: EAN Barcode Finder
  Category: Automation
  Version: v1.0.0
  Tags: barcode, ean, web-scraping
  Dependencies: playwright, duckduckgo-search, python-dotenv

Tool 2: Sales Data Processor
  Category: Data Processing
  Version: v2.1.0
  Tags: csv, pandas, sales, etl
  Dependencies: pandas, openpyxl, numpy

Tool 3: Power BI Report Exporter
  Category: Reporting
  Version: v1.2.0
  Tags: power-bi, export, pdf
  Dependencies: requests, pdfkit
```

---

## 8. Error Handling Strategy

| Scenario | Frontend Behavior | Backend Behavior |
|----------|------------------|-----------------|
| Invalid login | Toast: "Invalid email or password" | 401 with detail |
| Unauthorized access | Redirect to /login | 401 |
| Admin route as user | Redirect to / | 403 |
| File too large | Toast: "File exceeds 100MB limit" | 413 |
| Wrong file type | Toast: "Only .zip files allowed" | 422 |
| Network error | Toast: "Server unreachable" | — |
| DB error | Toast: "Something went wrong" | 500 with log |
| Duplicate email | Form error: "Email already registered" | 409 |

---

## 9. API Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Paginated List
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 50,
    "page": 1,
    "per_page": 12,
    "pages": 5
  }
}
```

### Error
```json
{
  "success": false,
  "detail": "Error description"
}
```

---

## 10. Git Repository Structure (Monorepo)

```
automation-tools-repo/
├── frontend/          ← React Vite app
├── backend/           ← FastAPI app
│   └── venv/          ← Python venv (gitignored)
├── docs/              ← Additional project documentation
├── architecture.md    ← This file's sibling
├── project.md         ← This file
├── todotask.md        ← Development task checklist
├── .gitignore
└── README.md
```

### `.gitignore` (root)
```
# Python
backend/venv/
backend/__pycache__/
backend/.env
backend/uploads/

# Node
frontend/node_modules/
frontend/dist/
frontend/.env

# DB
*.sqlite
```

---

*Last updated: Project v1.0 — Automation Tools Repository*
