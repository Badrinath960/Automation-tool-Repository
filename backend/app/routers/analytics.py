"""
Analytics router — admin analytics endpoints.
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db, require_admin
from app.models.user import User
from app.services import analytics_service
import io

router = APIRouter(prefix="/api/analytics", tags=["Analytics (Admin)"])


@router.get("/overview", response_model=dict)
async def get_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] Get overview stats: total tools, dashboards, users, downloads."""
    data = await analytics_service.get_overview(db)
    return {"success": True, "data": data}


@router.get("/downloads", response_model=dict)
async def get_download_trends(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] Get daily download trends for the last N days."""
    data = await analytics_service.get_download_trend(db, days)
    return {"success": True, "data": data}


@router.get("/top-tools", response_model=dict)
async def get_top_tools(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] Get top downloaded tools."""
    data = await analytics_service.get_top_tools(db, limit)
    return {"success": True, "data": data}


@router.get("/user-activity", response_model=dict)
async def get_user_activity(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] Get daily user registration trends."""
    data = await analytics_service.get_user_registrations(db, days)
    return {"success": True, "data": data}


@router.get("/recent-downloads", response_model=dict)
async def get_recent_downloads(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] Get recent download log entries."""
    data = await analytics_service.get_download_logs(db, limit)
    return {"success": True, "data": data}


@router.get("/export-csv")
async def export_downloads_csv(
    start_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] Export download logs as CSV file."""
    start = datetime.fromisoformat(start_date) if start_date else None
    end = datetime.fromisoformat(end_date) if end_date else None

    csv_content = await analytics_service.export_download_csv(db, start, end)

    return StreamingResponse(
        io.BytesIO(csv_content.encode("utf-8")),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=download_logs.csv",
        },
    )
