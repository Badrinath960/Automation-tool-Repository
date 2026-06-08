# TodoTask.md — Automation Tools Repository (ATR)
## Sprint-by-Sprint Development Task Checklist

> **Usage:** Work through phases in order. Each task is atomic — complete before moving to next.  
> **Stack:** React+Vite (Node v26.3.0), FastAPI Python 3.12.6, PostgreSQL 17.5.2  
> **Venv path:** `backend/venv/`  
> Status: `[ ]` = pending | `[x]` = done | `[~]` = in progress

---

## PHASE 0 — Project Scaffolding & Environment Setup

### 0.1 Root Structure
- [x] Create root folder `automation-tools-repo/`
- [x] Create `frontend/`, `backend/`, `docs/` subdirectories
- [x] Copy `architecture.md`, `project.md`, `todotask.md` into root
- [x] Create root `.gitignore` with node_modules, venv, .env, uploads patterns
- [x] Init git repo: `git init && git add . && git commit -m "chore: initial scaffold"`

### 0.2 Frontend Bootstrap
- [x] `npm create vite@latest frontend -- --template react`
- [x] `cd frontend && npm install`
- [x] Install all dependencies:
  ```bash
  npm install react-router-dom axios recharts lucide-react react-hook-form react-hot-toast clsx tailwind-merge
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```
- [x] Configure `tailwind.config.js` with content paths and custom primary color palette
- [x] Add Tailwind directives to `src/index.css`
- [x] Configure `vite.config.js` with proxy `/api → http://localhost:8000`
- [x] Create `.env` with `VITE_API_BASE_URL=http://localhost:8000`
- [x] Verify dev server runs: `npm run dev` → http://localhost:5173

### 0.3 Backend Bootstrap
- [x] `cd backend && python -m venv venv`
- [x] Activate venv
- [x] Create `requirements.txt` with all listed packages
- [x] `pip install -r requirements.txt`
- [x] Create `backend/.env` with DB URL, SECRET_KEY, UPLOAD_DIR vars
- [x] Create folder structure: `app/`, `app/models/`, `app/schemas/`, `app/routers/`, `app/services/`, `app/utils/`
- [x] Create empty `__init__.py` in each folder
- [x] Create `uploads/tools/` and `uploads/thumbnails/` directories

### 0.4 Database Setup
- [x] Open pgAdmin, create database: `automation_tools_repo`
- [x] Test connection: `psql -U postgres -d automation_tools_repo`
- [x] Create `.env` with correct DB URL
- [x] Initialize Alembic: `alembic init alembic`
- [x] Configure `alembic/env.py` to use `DATABASE_URL` from `.env`

---

## PHASE 1 — Backend Core: Models, DB, Auth

### 1.1 Database Models
- [x] Create `app/config.py` — Settings class with pydantic-settings, load .env
- [x] Create `app/database.py` — AsyncEngine, AsyncSession, Base, get_db dependency
- [x] Create `app/models/user.py` — User model with UUID PK, email, password_hash, full_name, role enum, is_active, timestamps
- [x] Create `app/models/category.py` — Category model: id, name, description, icon
- [x] Create `app/models/tool.py` — Tool model: all fields including JSONB dependencies, TEXT[] tags, TEXT documentation
- [x] Create `app/models/tool_version.py` — ToolVersion model: tool_id FK, version_number, file_path, file_size_bytes, release_notes, is_latest
- [x] Create `app/models/dashboard.py` — Dashboard model: embed_url, thumbnail_path, TEXT[] tags
- [x] Create `app/models/download_log.py` — DownloadLog model with all FK relationships
- [x] Import all models in `app/models/__init__.py`

### 1.2 Alembic Migrations
- [x] `alembic revision --autogenerate -m "create_all_tables"`
- [x] Review generated migration file for correctness
- [x] `alembic upgrade head` — run migration
- [x] Verify tables created in pgAdmin

### 1.3 Pydantic Schemas
- [x] Create `app/schemas/user.py` — UserCreate, UserLogin, UserOut, UserUpdate, Token, TokenPayload
- [x] Create `app/schemas/tool.py` — ToolCreate, ToolUpdate, ToolOut, ToolListItem, VersionCreate, VersionOut
- [x] Create `app/schemas/dashboard.py` — DashboardCreate, DashboardUpdate, DashboardOut
- [x] Create `app/schemas/analytics.py` — OverviewStats, DownloadTrend, TopTool

### 1.4 Security Utils
- [x] Create `app/utils/security.py`:
  - [x] `hash_password(password)` → bcrypt hash
  - [x] `verify_password(plain, hashed)` → bool
  - [x] `create_access_token(data, expires_delta)` → JWT string
  - [x] `decode_access_token(token)` → payload dict

### 1.5 Dependencies
- [x] Create `app/dependencies.py`:
  - [x] `get_db()` — async DB session generator
  - [x] `get_current_user(token, db)` — decode JWT, fetch user, raise 401 if invalid
  - [x] `require_admin(current_user)` — raise 403 if not admin

### 1.6 Auth Router
- [x] Create `app/routers/auth.py`:
  - [x] `POST /api/auth/register` — validate email unique, hash password, insert user, return 201
  - [x] `POST /api/auth/login` — verify credentials, return JWT token
  - [x] `GET /api/auth/me` — return current user info
- [x] Create `app/services/auth_service.py` with business logic separated

### 1.7 FastAPI App Entry
- [x] Create `app/main.py`:
  - [x] FastAPI instance with title, description
  - [x] CORSMiddleware: allow_origins=["http://localhost:5173"], allow credentials, methods, headers
  - [x] Include auth router
  - [x] Static files mount for `/uploads` directory
  - [x] Root `/` health check endpoint
- [x] Test: `uvicorn app.main:app --reload --port 8000`
- [x] Test auth endpoints in Swagger UI: http://localhost:8000/docs

### 1.8 Seed Script
- [x] Create `backend/seed.py`:
  - [x] Create default admin user from .env vars
  - [x] Insert 5 default categories with icons
  - [x] Insert 3 sample tools with placeholder ZIPs (if available)
- [x] `python seed.py` — verify in pgAdmin

---

## PHASE 2 — Backend: Tools, Dashboards, Files

### 2.1 File Handler Utils
- [x] Create `app/utils/file_handler.py`:
  - [x] `save_zip_file(file, tool_id, version)` → saves to uploads/tools/{tool_id}/, returns path
  - [x] `save_thumbnail(file, prefix, id)` → saves to uploads/thumbnails/, returns path
  - [x] `delete_file(path)` → safe delete
  - [x] `validate_zip(file)` → check extension + magic bytes (PK\x03\x04)
  - [x] `get_file_size(path)` → bytes

### 2.2 Tools Router + Service
- [x] Create `app/services/tool_service.py`:
  - [x] `get_tools(db, search, category, tags, page, per_page)` → paginated list
  - [x] `get_tool_by_id(db, tool_id)` → tool with latest version
  - [x] `create_tool(db, data, zip_file, thumbnail, user_id)` → insert tool + v1
  - [x] `update_tool(db, tool_id, data)` → update metadata
  - [x] `delete_tool(db, tool_id)` → soft delete (is_active=False)
  - [x] `add_version(db, tool_id, version_data, zip_file, user_id)` → new version, set is_latest
  - [x] `log_download(db, user_id, tool_id, version_id, ip, user_agent)` → insert download_log
- [x] Create `app/routers/tools.py` with all endpoints
- [x] Register tools router in `main.py`
- [x] Test all tool endpoints in Swagger

### 2.3 Dashboard Router + Service
- [x] Create `app/services/dashboard_service.py`:
  - [x] `get_dashboards(db, search, category, page, per_page)` → paginated
  - [x] `get_dashboard_by_id(db, dashboard_id)`
  - [x] `create_dashboard(db, data, thumbnail, user_id)`
  - [x] `update_dashboard(db, dashboard_id, data)`
  - [x] `delete_dashboard(db, dashboard_id)`
- [x] Create `app/routers/dashboards.py` with endpoints
- [x] Register dashboard router in `main.py`

### 2.4 Users Router (Admin)
- [x] Create `app/routers/users.py`:
  - [x] `GET /api/users` — list all users (admin)
  - [x] `PUT /api/users/:id/role` — change role (admin, cannot change self)
  - [x] `DELETE /api/users/:id` — delete user (admin)
  - [x] `GET /api/users/:id/downloads` — user's download history

### 2.5 Analytics Router + Service
- [x] Create `app/services/analytics_service.py`:
  - [x] `get_overview(db)` → total counts
  - [x] `get_download_trend(db, days)` → daily counts for last N days
  - [x] `get_top_tools(db, limit)` → top downloaded tools
  - [x] `get_user_registrations(db, days)` → daily new user counts
  - [x] `export_download_csv(db, start_date, end_date)` → CSV string
- [x] Create `app/routers/analytics.py` with endpoints
- [x] Register analytics router in `main.py`

---

## PHASE 3 — Frontend: Auth, Layout, Core

### 3.1 API Layer
- [x] Create `src/api/axiosInstance.js`:
  - [x] Base URL from `import.meta.env.VITE_API_BASE_URL`
  - [x] Request interceptor: attach `Authorization: Bearer <token>` from localStorage
  - [x] Response interceptor: redirect to /login on 401
- [x] Create `src/api/authApi.js` — register, login, getMe functions
- [x] Create `src/api/toolsApi.js` — getTools, getTool, downloadTool, admin CRUD
- [x] Create `src/api/dashboardsApi.js` — getDashboards, getDashboard, admin CRUD
- [x] Create `src/api/analyticsApi.js` — getOverview, getTrends, getTopTools, exportCsv

### 3.2 Auth Context
- [x] Create `src/context/AuthContext.jsx`:
  - [x] State: user, token, loading
  - [x] Actions: login(email, password), register(...), logout()
  - [x] On mount: read token from localStorage, validate with /api/auth/me
  - [x] Export `useAuth()` hook

### 3.3 Route Guards
- [x] Create `src/components/auth/PrivateRoute.jsx` — redirect /login if no token
- [x] Create `src/components/auth/AdminRoute.jsx` — redirect / if not admin
- [x] Wire up in `App.jsx` with React Router v6 nested routes

### 3.4 App Router (`App.jsx`)
- [x] Set up all routes:
  - `/login`, `/register`
  - `/` → redirect to `/tools`
  - `/tools`, `/tools/:id`
  - `/dashboards`, `/dashboards/:id`
  - `/admin`, `/admin/tools`, `/admin/users`, `/admin/analytics`
- [x] Wrap protected routes in PrivateRoute / AdminRoute

### 3.5 Common Components
- [x] Create `Navbar.jsx`:
  - [x] Logo, app name "ATR" in primary-700
  - [x] Global SearchBar component (controlled input, debounced, URL param sync)
  - [x] Nav links: Tools, Dashboards
  - [x] Admin link (visible if admin)
  - [x] User dropdown: name, logout button
- [x] Create `Sidebar.jsx` — admin sidebar with icon + label nav items
- [x] Create `LoadingSpinner.jsx` — centered animated spinner in primary color
- [x] Create `Modal.jsx` — reusable overlay modal with backdrop, close button
- [x] Create `ConfirmDialog.jsx` — "Are you sure?" modal with confirm/cancel
- [x] Create `Badge.jsx` — colored pill for categories, tags, versions
- [x] Create `Pagination.jsx` — prev/next + page numbers
- [x] Create `SearchBar.jsx` — magnifier icon input with clear button

---

## PHASE 4 — Frontend: Auth Pages

### 4.1 Login Page
- [x] Create `src/pages/LoginPage.jsx`:
  - [x] Centered card layout, light blue gradient background
  - [x] ATR logo/icon at top
  - [x] Email + password fields (react-hook-form)
  - [x] Validation: required, email format, min password length
  - [x] Submit button with loading state
  - [x] Error toast on failure
  - [x] Link to Register page
  - [x] On success: store token, redirect to /tools

### 4.2 Register Page
- [x] Create `src/pages/RegisterPage.jsx`:
  - [x] Full name, email, password, confirm password fields
  - [x] Client-side validation: password match, min 8 chars
  - [x] Success toast + redirect to /login
  - [x] Link to Login page

---

## PHASE 5 — Frontend: Tools Feature

### 5.1 Tool Listing
- [x] Create `src/pages/HomePage.jsx` (or ToolsPage):
  - [x] Fetch tools with search + filters from URL params
  - [x] Filter sidebar/panel: Category checkboxes, Tags
  - [x] Sort dropdown: Newest, Most Downloaded, Name A-Z
  - [x] Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
  - [x] Skeleton loading (6 placeholder cards while fetching)
  - [x] Empty state: "No tools found" with clear filters button
  - [x] Pagination component at bottom

- [x] Create `src/components/tools/ToolCard.jsx`:
  - [x] 16:9 thumbnail (default placeholder if none)
  - [x] Featured badge (primary-500 background)
  - [x] Tool name, version badge
  - [x] Category badge (colored by category)
  - [x] 2-line truncated description
  - [x] Tags (first 3, +N more if more)
  - [x] Download count with icon
  - [x] Download button (primary-600, hover:primary-700)
  - [x] Click card body → navigate to detail page

### 5.2 Tool Detail Page
- [x] Create `src/pages/ToolDetailPage.jsx`:
  - [x] Fetch tool by ID with full details
  - [x] Breadcrumb: Home > Category > Tool Name
  - [x] Hero section: thumbnail (left), title + meta (right)
  - [x] Download latest button (prominent, primary-600)
  - [x] Admin action buttons: Edit, Delete, New Version (only if admin)
  - [x] Tabs: Overview | Documentation | Version History | Dependencies
- [x] Create `src/components/tools/DocumentationViewer.jsx`:
  - [x] Render documentation TEXT as pre-formatted or simple parsed Markdown
  - [x] Step-by-step numbered sections
- [x] Create `src/components/tools/VersionHistory.jsx`:
  - [x] Table: Version, Date, File Size, Release Notes, Download button
  - [x] Current/latest badge
- [x] Create `src/components/tools/ToolUploadForm.jsx` (modal form):
  - [x] All fields from spec (name, slug auto-gen, description, etc.)
  - [x] Thumbnail preview on image select
  - [x] ZIP file drag-and-drop or browse
  - [x] File size display after selection
  - [x] Submit with loading state

---

## PHASE 6 — Frontend: Dashboards Feature

### 6.1 Dashboard Listing
- [x] Create `src/pages/DashboardsPage.jsx`:
  - [x] Fetch dashboards with search + filters
  - [x] Same grid layout as tools
  - [x] Filter by category
- [x] Create `src/components/dashboards/DashboardCard.jsx`:
  - [x] Thumbnail, name, description, "View Dashboard" button
  - [x] Featured badge
  - [x] Admin: Edit, Delete buttons

### 6.2 Dashboard Viewer
- [x] Create `src/pages/DashboardViewerPage.jsx`:
  - [x] Fetch dashboard by ID
  - [x] Info panel (name, description, tags, category)
  - [x] Iframe with embed_url, sandbox attributes
  - [x] Full-screen button (sets iframe to 100vw/100vh modal)
  - [x] "Open in new tab" link
  - [x] Loading overlay on iframe load

---

## PHASE 7 — Frontend: Admin Panel

### 7.1 Admin Dashboard
- [x] Create `src/pages/admin/AdminDashboard.jsx`:
  - [x] KPI cards row: 4 cards with icons (Package, LayoutDashboard, Users, Download)
  - [x] Line chart: download trends (Recharts LineChart, responsive)
  - [x] Bar chart: top 10 tools (Recharts BarChart)
  - [x] Recent downloads table (last 20)

### 7.2 Manage Tools Page
- [x] Create `src/pages/admin/ManageTools.jsx`:
  - [x] Table with sortable columns
  - [x] Search/filter input
  - [x] Add Tool button → ToolUploadForm modal
  - [x] Edit button → pre-filled ToolUploadForm modal
  - [x] New Version button → VersionUploadModal
  - [x] Toggle Active switch
  - [x] Delete button → ConfirmDialog
- [x] Create `src/components/admin/AdminToolTable.jsx`

### 7.3 Manage Users Page
- [x] Create `src/pages/admin/ManageUsers.jsx`:
  - [x] Table: Name, Email, Role badge, Status, Registered, Last Login, Downloads
  - [x] Promote to Admin button (with ConfirmDialog)
  - [x] Deactivate/Activate toggle
  - [x] Delete button (with ConfirmDialog, disabled for self)
- [x] Create `src/components/admin/UserManagementTable.jsx`

### 7.4 Analytics Page
- [x] Create `src/pages/admin/AnalyticsPage.jsx`:
  - [x] Date range tabs: 7d | 30d | 90d
  - [x] Download trend line chart
  - [x] Tool downloads bar chart
  - [x] User registration line chart
  - [x] Export CSV button (downloads file via blob URL)
- [x] Create `src/components/admin/AnalyticsChart.jsx` — reusable chart wrapper

---

## PHASE 8 — Integration & Polish

### 8.1 End-to-End Integration Testing
- [x] Test user registration → login → browse tools → download tool → verify download_log entry
- [x] Test admin login → add tool (with ZIP) → verify file saved to uploads/tools/
- [x] Test admin → new version upload → verify is_latest updated
- [x] Test admin → manage users → promote user to admin
- [x] Test analytics: download count reflected in charts
- [x] Test global search: search by name, tag, description
- [x] Test filter by category
- [x] Test dashboard viewer: iframe loads Power BI URL

### 8.2 Error State Polish
- [x] Add error boundary component wrapping main routes
- [x] 404 page for unknown routes
- [x] Empty state illustrations/icons for: no tools, no dashboards, no users
- [x] Toast notifications wired to all API success/error calls
- [x] Form validation errors display under fields

### 8.3 Loading State Polish
- [x] Skeleton cards on tool listing load
- [x] Skeleton rows on admin table load
- [x] Button loading spinners on all form submits
- [x] Iframe loading overlay on dashboard viewer

### 8.4 Responsive Design Pass
- [x] Mobile navbar: hamburger menu, search collapsible
- [x] Tool cards: single column on mobile
- [x] Admin tables: horizontal scroll on mobile
- [x] Modal forms: full-screen on mobile
- [x] Sidebar: slide-in drawer on mobile (admin panel)

### 8.5 UI Polish Pass
- [x] Consistent spacing using Tailwind spacing scale
- [x] Hover states on all clickable elements
- [x] Focus rings for keyboard accessibility
- [x] Consistent border-radius (rounded-xl for cards, rounded-lg for inputs)
- [x] Box shadows: shadow-sm on cards, shadow-md on modals
- [x] Transition animations: `transition-all duration-200` on hover states

---

## PHASE 9 — Security & Final Checks

### 9.1 Backend Security
- [x] Validate file extension AND magic bytes for ZIP uploads
- [x] Sanitize filename before saving (remove path traversal chars)
- [x] Enforce MAX_UPLOAD_SIZE_MB limit in FastAPI
- [x] Admin endpoints all have `require_admin` dependency
- [x] User cannot access other user's data
- [x] Cannot delete own admin account
- [x] CORS locked to localhost:5173 only

### 9.2 Frontend Security
- [x] Token cleared on logout AND on 401 response
- [x] No sensitive data in localStorage except JWT token
- [x] Admin UI elements only rendered when role=admin (defense in depth)
- [x] No direct file path exposure (serve through /api/files/ route)

### 9.3 Database Final Check
- [x] All FK constraints verified in pgAdmin
- [x] Indexes created for search-heavy columns
- [x] UUID primary keys on all tables
- [x] Timestamps auto-populated

---

## PHASE 10 — Documentation & README

### 10.1 README.md
- [x] Project overview paragraph
- [x] Prerequisites (Node v26.3.0, Python 3.12.6, PostgreSQL 17.5.2)
- [x] Quick start steps (copy-paste commands)
- [x] Environment variables reference
- [x] Default credentials
- [x] API documentation link (Swagger /docs)

### 10.2 In-App Documentation
- [x] "How to Upload a Tool" guide (admin facing)
- [x] "How to Download and Use a Tool" guide (user facing)
- [x] About page with tech stack info

---

## Quick Reference — File Creation Order

```
Phase 0:  project scaffold + vite + venv
Phase 1:  config → database → models → alembic → schemas → security → auth → main → seed
Phase 2:  file_handler → tool_service → tools router → dashboard_service → dashboards router → users → analytics
Phase 3:  axiosInstance → api files → AuthContext → PrivateRoute/AdminRoute → App.jsx → common components
Phase 4:  LoginPage → RegisterPage
Phase 5:  ToolsPage → ToolCard → ToolDetailPage → DocumentationViewer → VersionHistory → ToolUploadForm
Phase 6:  DashboardsPage → DashboardCard → DashboardViewerPage
Phase 7:  AdminDashboard → ManageTools → ManageUsers → AnalyticsPage
Phase 8:  integration testing → error states → loading states → responsive → UI polish
Phase 9:  security hardening → final DB check
Phase 10: README → in-app docs
```

---

## Known Risks & Notes for Vibe Coding

1. **asyncpg + Windows**: May need `pip install asyncpg --pre` on Windows if standard install fails.
2. **CORS on file downloads**: File download via `Content-Disposition: attachment` needs CORS `expose_headers: ['Content-Disposition']`.
3. **Power BI iframes**: Power BI embed URLs may require authentication in the viewer's browser — use public report links for demo.
4. **PostgreSQL TEXT[]**: SQLAlchemy maps to `ARRAY(String)` — use `Column(ARRAY(String))` in model.
5. **UUID in pgAdmin**: Use `gen_random_uuid()` as default — requires PostgreSQL 13+ (17.5.2 ✓).
6. **Vite proxy in prod**: Remove proxy config and set full API URL in .env for any production deployment.
7. **Token expiry**: JWT set to 30 days (43200 min) for demo convenience — reduce for production.

---

*Last updated: TodoTask v1.0 — Automation Tools Repository*
