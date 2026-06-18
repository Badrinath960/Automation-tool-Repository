"""
Dashboard service — business logic for dashboard CRUD.
"""
import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.dashboard import Dashboard
from app.schemas.dashboard import DashboardCreate, DashboardUpdate


async def get_dashboards(
    db: AsyncSession,
    search: Optional[str] = None,
    category_id: Optional[uuid.UUID] = None,
    page: int = 1,
    per_page: int = 12,
) -> dict:
    """Get paginated list of dashboards with search and filters."""
    query = select(Dashboard).where(Dashboard.is_active == True)

    # Search filter
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Dashboard.name.ilike(search_term),
                Dashboard.description.ilike(search_term),
            )
        )

    # Category filter
    if category_id:
        query = query.where(Dashboard.category_id == category_id)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Pagination
    offset = (page - 1) * per_page
    query = (
        query.order_by(Dashboard.created_at.desc())
        .offset(offset)
        .limit(per_page)
        .options(selectinload(Dashboard.category))
    )

    result = await db.execute(query)
    dashboards = result.scalars().unique().all()

    items = []
    for d in dashboards:
        items.append({
            "id": d.id,
            "name": d.name,
            "description": d.description,
            "long_description": d.long_description,
            "embed_url": d.embed_url,
            "report_url": d.report_url,
            "report_type": d.report_type,
            "thumbnail_path": d.thumbnail_path,
            "category": {
                "id": d.category.id,
                "name": d.category.name,
                "description": d.category.description,
                "icon": d.category.icon,
            } if d.category else None,
            "created_by": d.created_by,
            "is_active": d.is_active,
            "is_featured": d.is_featured,
            "tags": d.tags,
            "created_at": d.created_at,
            "updated_at": d.updated_at,
        })

    pages = (total + per_page - 1) // per_page if per_page > 0 else 0

    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
    }


async def get_dashboard_by_id(db: AsyncSession, dashboard_id: uuid.UUID) -> dict:
    """Get full dashboard detail by ID."""
    result = await db.execute(
        select(Dashboard)
        .where(Dashboard.id == dashboard_id)
        .options(selectinload(Dashboard.category))
    )
    dashboard = result.scalar_one_or_none()

    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard not found",
        )

    return {
        "id": dashboard.id,
        "name": dashboard.name,
        "description": dashboard.description,
        "long_description": dashboard.long_description,
        "embed_url": dashboard.embed_url,
        "report_url": dashboard.report_url,
        "report_type": dashboard.report_type,
        "thumbnail_path": dashboard.thumbnail_path,
        "category": {
            "id": dashboard.category.id,
            "name": dashboard.category.name,
            "description": dashboard.category.description,
            "icon": dashboard.category.icon,
        } if dashboard.category else None,
        "created_by": dashboard.created_by,
        "is_active": dashboard.is_active,
        "is_featured": dashboard.is_featured,
        "tags": dashboard.tags,
        "created_at": dashboard.created_at,
        "updated_at": dashboard.updated_at,
    }


async def create_dashboard(
    db: AsyncSession,
    data: DashboardCreate,
    user_id: uuid.UUID,
    thumbnail_path: Optional[str] = None,
) -> Dashboard:
    """Create a new dashboard entry."""
    dashboard = Dashboard(
        name=data.name,
        description=data.description,
        long_description=data.long_description,
        embed_url=data.embed_url,
        report_url=data.report_url,
        report_type=data.report_type,
        category_id=data.category_id,
        created_by=user_id,
        tags=data.tags,
        is_featured=data.is_featured,
        thumbnail_path=thumbnail_path,
        is_active=True,
    )
    db.add(dashboard)
    await db.commit()
    await db.refresh(dashboard)
    return dashboard


async def update_dashboard(
    db: AsyncSession,
    dashboard_id: uuid.UUID,
    data: DashboardUpdate,
) -> Dashboard:
    """Update dashboard metadata."""
    result = await db.execute(
        select(Dashboard).where(Dashboard.id == dashboard_id)
    )
    dashboard = result.scalar_one_or_none()

    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(dashboard, key, value)

    await db.commit()
    await db.refresh(dashboard)
    return dashboard


async def delete_dashboard(db: AsyncSession, dashboard_id: uuid.UUID) -> Dashboard:
    """Soft delete a dashboard."""
    result = await db.execute(
        select(Dashboard).where(Dashboard.id == dashboard_id)
    )
    dashboard = result.scalar_one_or_none()

    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard not found",
        )

    dashboard.is_active = False
    await db.commit()
    return dashboard
