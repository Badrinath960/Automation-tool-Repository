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


# Request Size Limit Middleware (50MB)
from fastapi import Request, Response
from fastapi.responses import JSONResponse

@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    MAX_SIZE = 50 * 1024 * 1024  # 50 Megabytes
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > MAX_SIZE:
                return JSONResponse(
                    status_code=413,
                    content={
                        "success": False,
                        "data": None,
                        "message": "Request payload exceeds size limit of 50MB",
                        "error": {
                            "code": "PAYLOAD_TOO_LARGE",
                            "details": f"Content-Length: {content_length} bytes"
                        }
                    }
                )
        except ValueError:
            pass
    return await call_next(request)


# Exception Handlers
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    from app.config import get_settings
    settings = get_settings()
    is_debug = getattr(settings, "DEBUG", False) or os.getenv("DEBUG", "false").lower() == "true"
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "message": "An unexpected internal server error occurred.",
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "details": str(exc)
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "data": None,
            "message": "Validation error occurred.",
            "error": {
                "code": "VALIDATION_ERROR",
                "details": exc.errors()
            }
        }
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "data": None,
            "message": exc.detail,
            "error": {
                "code": "HTTP_ERROR",
                "details": None
            }
        }
    )


@app.get("/", tags=["Health"])
async def health_check():
    """Root health check endpoint."""
    return {
        "success": True,
        "message": "ATR Hub API is running",
        "version": "1.0.0",
    }
