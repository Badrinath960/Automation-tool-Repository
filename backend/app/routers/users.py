"""
Users router — admin user management.
"""
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.dependencies import get_db, require_admin
from app.models.user import User, UserRole
from app.models.download_log import DownloadLog
from app.schemas.user import UserOut, UserRoleUpdate

router = APIRouter(prefix="/api/users", tags=["Users (Admin)"])


@router.get("", response_model=dict)
async def list_users(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] List all users with download counts."""
    query = select(User)

    if search:
        search_term = f"%{search}%"

        query = query.where(
            or_(
                User.full_name.ilike(search_term),
                User.email.ilike(search_term),
            )
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Pagination
    offset = (page - 1) * per_page
    query = query.order_by(User.created_at.desc()).offset(offset).limit(per_page)

    result = await db.execute(query)
    users = result.scalars().all()

    items = []
    for user in users:
        # Get download count
        dl_result = await db.execute(
            select(func.count(DownloadLog.id)).where(DownloadLog.user_id == user.id)
        )
        download_count = dl_result.scalar() or 0

        items.append({
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "download_count": download_count,
        })

    pages = (total + per_page - 1) // per_page if per_page > 0 else 0

    return {
        "success": True,
        "data": {
            "items": items,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": pages,
        },
    }


@router.put("/{user_id}/role", response_model=dict)
async def change_user_role(
    user_id: uuid.UUID,
    role_data: UserRoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] Change a user's role. Cannot change own role."""
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.role = role_data.role
    await db.commit()
    await db.refresh(user)

    return {
        "success": True,
        "data": UserOut.model_validate(user).model_dump(),
        "message": f"User '{user.full_name}' role changed to {role_data.role.value}",
    }


@router.delete("/{user_id}", response_model=dict)
async def delete_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] Delete a user. Cannot delete self."""
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    await db.delete(user)
    await db.commit()

    return {
        "success": True,
        "message": f"User '{user.full_name}' deleted",
    }


@router.get("/{user_id}/downloads", response_model=dict)
async def get_user_downloads(
    user_id: uuid.UUID,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] Get a user's download history."""
    from sqlalchemy.orm import selectinload

    query = (
        select(DownloadLog)
        .where(DownloadLog.user_id == user_id)
        .options(
            selectinload(DownloadLog.tool),
            selectinload(DownloadLog.tool_version),
        )
        .order_by(DownloadLog.downloaded_at.desc())
    )

    # Count
    count_query = select(func.count()).select_from(
        select(DownloadLog.id).where(DownloadLog.user_id == user_id).subquery()
    )
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)

    result = await db.execute(query)
    logs = result.scalars().unique().all()

    items = []
    for log in logs:
        items.append({
            "id": str(log.id),
            "tool_name": log.tool.name if log.tool else None,
            "version": log.tool_version.version_number if log.tool_version else None,
            "downloaded_at": log.downloaded_at.isoformat() if log.downloaded_at else None,
            "ip_address": log.ip_address,
        })

    pages = (total + per_page - 1) // per_page if per_page > 0 else 0

    return {
        "success": True,
        "data": {
            "items": items,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": pages,
        },
    }


