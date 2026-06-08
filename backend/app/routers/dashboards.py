"""
Dashboards router — CRUD for Power BI dashboards.
"""
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db, get_current_user, require_admin
from app.models.user import User
from app.services import dashboard_service
from app.utils.file_handler import save_thumbnail

router = APIRouter(prefix="/api/dashboards", tags=["Dashboards"])


@router.get("", response_model=dict)
async def list_dashboards(
    search: Optional[str] = Query(None),
    category_id: Optional[uuid.UUID] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """List dashboards with search, filters, and pagination."""
    data = await dashboard_service.get_dashboards(
        db, search=search, category_id=category_id,
        page=page, per_page=per_page,
    )
    return {"success": True, "data": data}


@router.get("/{dashboard_id}", response_model=dict)
async def get_dashboard(
    dashboard_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard detail by ID."""
    data = await dashboard_service.get_dashboard_by_id(db, dashboard_id)
    return {"success": True, "data": data}


@router.post("", response_model=dict, status_code=201)
async def create_dashboard(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    embed_url: str = Form(...),
    category_id: Optional[uuid.UUID] = Form(None),
    tags: Optional[str] = Form(None),
    is_featured: bool = Form(False),
    thumbnail: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] Create a new dashboard."""
    from app.schemas.dashboard import DashboardCreate

    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else None

    dashboard_data = DashboardCreate(
        name=name,
        description=description,
        embed_url=embed_url,
        category_id=category_id,
        tags=tag_list,
        is_featured=is_featured,
    )

    # Save thumbnail if provided
    thumb_path = None
    if thumbnail and thumbnail.filename:
        thumb_path = await save_thumbnail(thumbnail, "dash", uuid.uuid4())

    dashboard = await dashboard_service.create_dashboard(
        db, dashboard_data, current_user.id, thumb_path,
    )

    # Update thumbnail path with actual dashboard ID
    if thumbnail and thumbnail.filename:
        new_thumb_path = await save_thumbnail(thumbnail, "dash", dashboard.id)
        dashboard.thumbnail_path = new_thumb_path
        await db.commit()

    return {
        "success": True,
        "data": {"id": str(dashboard.id), "name": dashboard.name},
        "message": f"Dashboard '{dashboard.name}' created successfully",
    }


@router.put("/{dashboard_id}", response_model=dict)
async def update_dashboard(
    dashboard_id: uuid.UUID,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    embed_url: Optional[str] = Form(None),
    category_id: Optional[uuid.UUID] = Form(None),
    tags: Optional[str] = Form(None),
    is_featured: Optional[bool] = Form(None),
    is_active: Optional[bool] = Form(None),
    thumbnail: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] Update dashboard metadata."""
    from app.schemas.dashboard import DashboardUpdate

    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else None

    update_data = DashboardUpdate(
        name=name,
        description=description,
        embed_url=embed_url,
        category_id=category_id,
        tags=tag_list,
        is_featured=is_featured,
        is_active=is_active,
    )

    dashboard = await dashboard_service.update_dashboard(db, dashboard_id, update_data)

    # Update thumbnail if provided
    if thumbnail and thumbnail.filename:
        thumb_path = await save_thumbnail(thumbnail, "dash", dashboard.id)
        dashboard.thumbnail_path = thumb_path
        await db.commit()

    return {
        "success": True,
        "data": {"id": str(dashboard.id), "name": dashboard.name},
        "message": f"Dashboard '{dashboard.name}' updated successfully",
    }


@router.delete("/{dashboard_id}", response_model=dict)
async def delete_dashboard(
    dashboard_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] Soft delete a dashboard."""
    dashboard = await dashboard_service.delete_dashboard(db, dashboard_id)
    return {
        "success": True,
        "message": f"Dashboard '{dashboard.name}' deactivated",
    }
