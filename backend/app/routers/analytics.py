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


# --- Category Management Endpoints (Admin Only) ---

from sqlalchemy import select, update
from app.models.category import Category
from app.schemas.tool import CategoryOut
from pydantic import BaseModel
import uuid

class CategoryCreateAdmin(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = "folder"


@router.get("/categories", response_model=dict)
async def list_categories_admin(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] List all categories."""
    result = await db.execute(select(Category).order_by(Category.name))
    categories = result.scalars().all()
    data = [CategoryOut.model_validate(c).model_dump() for c in categories]
    return {"success": True, "data": data}


@router.post("/categories", response_model=dict)
async def create_category_admin(
    cat_data: CategoryCreateAdmin,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] Create a new category."""
    existing = await db.execute(select(Category).where(Category.name == cat_data.name))
    if existing.scalar_one_or_none():
        from fastapi import HTTPException
        raise HTTPException(status_code=409, detail=f"Category '{cat_data.name}' already exists")
    
    cat = Category(
        name=cat_data.name,
        description=cat_data.description,
        icon=cat_data.icon
    )
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return {
        "success": True,
        "data": CategoryOut.model_validate(cat).model_dump(),
        "message": f"Category '{cat.name}' created successfully"
    }


@router.delete("/categories/{category_id}", response_model=dict)
async def delete_category_admin(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] Delete a category."""
    result = await db.execute(select(Category).where(Category.id == category_id))
    cat = result.scalar_one_or_none()
    if not cat:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Category not found")
    
    from app.models.tool import Tool
    from app.models.dashboard import Dashboard
    
    # Dissociate tools and dashboards before deleting category
    await db.execute(
        update(Tool).where(Tool.category_id == category_id).values(category_id=None)
    )
    await db.execute(
        update(Dashboard).where(Dashboard.category_id == category_id).values(category_id=None)
    )
    
    await db.delete(cat)
    await db.commit()
    return {
        "success": True,
        "message": f"Category '{cat.name}' deleted successfully"
    }
