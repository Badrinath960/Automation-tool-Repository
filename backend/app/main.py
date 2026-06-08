from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from app.routers import auth, tools, dashboards, users, analytics, files


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown events."""
    # Ensure upload directories exist
    os.makedirs("uploads/tools", exist_ok=True)
    os.makedirs("uploads/thumbnails", exist_ok=True)
    yield


app = FastAPI(
    title="Automation Tools Repository (ATR)",
    description="API for managing, discovering, and downloading Python automation tools and Power BI dashboards.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],  # For file downloads
)

# Include all routers
app.include_router(auth.router)
app.include_router(tools.router)
app.include_router(dashboards.router)
app.include_router(users.router)
app.include_router(analytics.router)
app.include_router(files.router)


@app.get("/", tags=["Health"])
async def health_check():
    """Root health check endpoint."""
    return {
        "success": True,
        "message": "ATR API is running",
        "version": "1.0.0",
    }
