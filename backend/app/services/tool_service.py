"""
Tool service — business logic for tool CRUD, versioning, and downloads.
"""
import re
import uuid
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, update
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status, UploadFile

from app.models.tool import Tool
from app.models.tool_version import ToolVersion
from app.models.download_log import DownloadLog
from app.models.category import Category
from app.schemas.tool import ToolCreate, ToolUpdate, VersionCreate
from app.utils.file_handler import save_zip_file, save_thumbnail, validate_zip, delete_file


def _generate_slug(name: str) -> str:
    """Generate a URL-friendly slug from a tool name."""
    slug = name.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_]+", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug


async def get_tools(
    db: AsyncSession,
    search: Optional[str] = None,
    category_id: Optional[uuid.UUID] = None,
    tags: Optional[List[str]] = None,
    sort_by: str = "newest",
    page: int = 1,
    per_page: int = 12,
) -> dict:
    """Get paginated list of tools with search and filters."""
    query = select(Tool).where(Tool.is_active == True)

    # Search filter
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Tool.name.ilike(search_term),
                Tool.description.ilike(search_term),
                Tool.tags.any(search),
            )
        )

    # Category filter
    if category_id:
        query = query.where(Tool.category_id == category_id)

    # Tags filter
    if tags:
        for tag in tags:
            query = query.where(Tool.tags.any(tag))

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Sorting
    if sort_by == "newest":
        query = query.order_by(Tool.created_at.desc())
    elif sort_by == "name":
        query = query.order_by(Tool.name.asc())
    elif sort_by == "downloads":
        # Sub-query for download counts
        download_count_sq = (
            select(
                DownloadLog.tool_id,
                func.count(DownloadLog.id).label("dl_count")
            )
            .group_by(DownloadLog.tool_id)
            .subquery()
        )
        query = query.outerjoin(
            download_count_sq, Tool.id == download_count_sq.c.tool_id
        ).order_by(download_count_sq.c.dl_count.desc().nullslast())

    # Pagination
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    query = query.options(selectinload(Tool.category), selectinload(Tool.versions))

    result = await db.execute(query)
    tools = result.scalars().unique().all()

    # Build response items with download counts and latest version
    items = []
    for tool in tools:
        # Get download count
        dl_result = await db.execute(
            select(func.count(DownloadLog.id)).where(DownloadLog.tool_id == tool.id)
        )
        download_count = dl_result.scalar() or 0

        # Get latest version
        latest_version = None
        for v in tool.versions:
            if v.is_latest:
                latest_version = {
                    "id": v.id,
                    "version_number": v.version_number,
                    "file_path": v.file_path,
                    "file_size_bytes": v.file_size_bytes,
                    "release_notes": v.release_notes,
                    "is_latest": v.is_latest,
                    "uploaded_by": v.uploaded_by,
                    "created_at": v.created_at,
                }
                break

        items.append({
            "id": tool.id,
            "name": tool.name,
            "slug": tool.slug,
            "description": tool.description,
            "category": {
                "id": tool.category.id,
                "name": tool.category.name,
                "description": tool.category.description,
                "icon": tool.category.icon,
            } if tool.category else None,
            "thumbnail_path": tool.thumbnail_path,
            "tags": tool.tags,
            "is_active": tool.is_active,
            "is_featured": tool.is_featured,
            "download_count": download_count,
            "latest_version": latest_version,
            "created_at": tool.created_at,
        })

    pages = (total + per_page - 1) // per_page if per_page > 0 else 0

    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
    }


async def get_tool_by_id(db: AsyncSession, tool_id: uuid.UUID) -> dict:
    """Get full tool detail by ID including versions and download count."""
    result = await db.execute(
        select(Tool)
        .where(Tool.id == tool_id)
        .options(
            selectinload(Tool.category),
            selectinload(Tool.versions),
        )
    )
    tool = result.scalar_one_or_none()

    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found",
        )

    # Get download count
    dl_result = await db.execute(
        select(func.count(DownloadLog.id)).where(DownloadLog.tool_id == tool.id)
    )
    download_count = dl_result.scalar() or 0

    # Build versions list
    versions = []
    for v in tool.versions:
        versions.append({
            "id": v.id,
            "tool_id": v.tool_id,
            "version_number": v.version_number,
            "file_path": v.file_path,
            "file_size_bytes": v.file_size_bytes,
            "release_notes": v.release_notes,
            "is_latest": v.is_latest,
            "uploaded_by": v.uploaded_by,
            "created_at": v.created_at,
        })

    # Get latest version
    latest_version = None
    for v in tool.versions:
        if v.is_latest:
            latest_version = {
                "id": v.id,
                "version_number": v.version_number,
                "file_path": v.file_path,
                "file_size_bytes": v.file_size_bytes,
                "release_notes": v.release_notes,
                "is_latest": v.is_latest,
                "uploaded_by": v.uploaded_by,
                "created_at": v.created_at,
            }
            break

    return {
        "id": tool.id,
        "name": tool.name,
        "slug": tool.slug,
        "description": tool.description,
        "long_description": tool.long_description,
        "category": {
            "id": tool.category.id,
            "name": tool.category.name,
            "description": tool.category.description,
            "icon": tool.category.icon,
        } if tool.category else None,
        "created_by": tool.created_by,
        "thumbnail_path": tool.thumbnail_path,
        "tags": tool.tags,
        "is_active": tool.is_active,
        "is_featured": tool.is_featured,
        "dependencies": tool.dependencies,
        "documentation": tool.documentation,
        "documentation_pdf_path": tool.documentation_pdf_path,
        "versions": versions,
        "latest_version": latest_version,
        "download_count": download_count,
        "created_at": tool.created_at,
        "updated_at": tool.updated_at,
    }


async def create_tool(
    db: AsyncSession,
    data: ToolCreate,
    zip_file: UploadFile,
    version_number: str,
    release_notes: Optional[str],
    user_id: uuid.UUID,
    thumbnail: Optional[UploadFile] = None,
) -> Tool:
    """Create a new tool with initial version ZIP upload."""
    # Validate ZIP
    await validate_zip(zip_file)

    # Generate slug
    slug = _generate_slug(data.name)

    # Check slug uniqueness
    existing = await db.execute(select(Tool).where(Tool.slug == slug))
    if existing.scalar_one_or_none():
        # Append random suffix
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"

    # Create tool
    tool = Tool(
        name=data.name,
        slug=slug,
        description=data.description,
        long_description=data.long_description,
        category_id=data.category_id,
        created_by=user_id,
        tags=data.tags,
        is_featured=data.is_featured,
        dependencies=data.dependencies,
        documentation=data.documentation,
        is_active=True,
    )
    db.add(tool)
    await db.commit()
    await db.refresh(tool)

    # Save thumbnail if provided
    if thumbnail and thumbnail.filename:
        thumb_path = await save_thumbnail(thumbnail, "tool", tool.id)
        tool.thumbnail_path = thumb_path
        await db.commit()

    # Save ZIP file
    file_path, file_size = await save_zip_file(zip_file, tool.id, version_number)

    # Create initial version
    version = ToolVersion(
        tool_id=tool.id,
        version_number=version_number,
        file_path=file_path,
        file_size_bytes=file_size,
        release_notes=release_notes,
        is_latest=True,
        uploaded_by=user_id,
    )
    db.add(version)
    await db.commit()
    await db.refresh(tool)

    return tool


async def update_tool(
    db: AsyncSession,
    tool_id: uuid.UUID,
    data: ToolUpdate,
) -> Tool:
    """Update tool metadata."""
    result = await db.execute(select(Tool).where(Tool.id == tool_id))
    tool = result.scalar_one_or_none()

    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(tool, key, value)

    await db.commit()
    await db.refresh(tool)
    return tool


async def delete_tool(db: AsyncSession, tool_id: uuid.UUID) -> Tool:
    """Soft delete a tool (set is_active=False)."""
    result = await db.execute(select(Tool).where(Tool.id == tool_id))
    tool = result.scalar_one_or_none()

    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found",
        )

    tool.is_active = False
    await db.commit()
    return tool


async def add_version(
    db: AsyncSession,
    tool_id: uuid.UUID,
    zip_file: UploadFile,
    version_number: str,
    release_notes: Optional[str],
    user_id: uuid.UUID,
) -> ToolVersion:
    """Upload a new version for an existing tool."""
    # Verify tool exists
    result = await db.execute(select(Tool).where(Tool.id == tool_id))
    tool = result.scalar_one_or_none()
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found",
        )

    # Check version doesn't already exist
    existing_version = await db.execute(
        select(ToolVersion).where(
            ToolVersion.tool_id == tool_id,
            ToolVersion.version_number == version_number,
        )
    )
    if existing_version.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Version {version_number} already exists for this tool",
        )

    # Validate ZIP
    await validate_zip(zip_file)

    # Unset current latest
    await db.execute(
        update(ToolVersion)
        .where(ToolVersion.tool_id == tool_id, ToolVersion.is_latest == True)
        .values(is_latest=False)
    )

    # Save file
    file_path, file_size = await save_zip_file(zip_file, tool_id, version_number)

    # Create version
    version = ToolVersion(
        tool_id=tool_id,
        version_number=version_number,
        file_path=file_path,
        file_size_bytes=file_size,
        release_notes=release_notes,
        is_latest=True,
        uploaded_by=user_id,
    )
    db.add(version)
    await db.commit()
    await db.refresh(version)

    return version


async def get_download_file(
    db: AsyncSession,
    tool_id: uuid.UUID,
    version_number: Optional[str] = None,
) -> ToolVersion:
    """Get the file path for a tool download (latest or specific version)."""
    if version_number:
        result = await db.execute(
            select(ToolVersion).where(
                ToolVersion.tool_id == tool_id,
                ToolVersion.version_number == version_number,
            )
        )
    else:
        result = await db.execute(
            select(ToolVersion).where(
                ToolVersion.tool_id == tool_id,
                ToolVersion.is_latest == True,
            )
        )

    version = result.scalar_one_or_none()
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Version not found",
        )
    return version


async def log_download(
    db: AsyncSession,
    user_id: uuid.UUID,
    tool_id: uuid.UUID,
    version_id: uuid.UUID,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> DownloadLog:
    """Record a tool download event."""
    log = DownloadLog(
        user_id=user_id,
        tool_id=tool_id,
        tool_version_id=version_id,
        ip_address=ip_address,
        user_agent=user_agent,
    )
    db.add(log)
    await db.commit()
    return log


async def get_categories(db: AsyncSession) -> list:
    """Get all categories."""
    result = await db.execute(select(Category).order_by(Category.name))
    categories = result.scalars().all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "icon": c.icon,
        }
        for c in categories
    ]


async def delete_tool_version(
    db: AsyncSession, tool_id: uuid.UUID, version_id: uuid.UUID
) -> ToolVersion:
    """[ADMIN] Delete a specific version of a tool."""
    # Verify version exists and belongs to tool
    result = await db.execute(
        select(ToolVersion).where(
            ToolVersion.id == version_id,
            ToolVersion.tool_id == tool_id
        )
    )
    version = result.scalar_one_or_none()
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool version not found",
        )

    # Check if this is the only version of the tool
    count_result = await db.execute(
        select(func.count(ToolVersion.id)).where(ToolVersion.tool_id == tool_id)
    )
    version_count = count_result.scalar() or 0
    if version_count <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete the only version of a tool. Please deactivate or delete the tool instead.",
        )

    # If the version being deleted is the latest version, promote the previous one
    if version.is_latest:
        prev_result = await db.execute(
            select(ToolVersion)
            .where(ToolVersion.tool_id == tool_id, ToolVersion.id != version_id)
            .order_by(ToolVersion.created_at.desc())
            .limit(1)
        )
        prev_version = prev_result.scalar_one_or_none()
        if prev_version:
            prev_version.is_latest = True

    # Nullify references in download logs to prevent foreign key errors
    await db.execute(
        update(DownloadLog)
        .where(DownloadLog.tool_version_id == version_id)
        .values(tool_version_id=None)
    )

    # Delete the physical file on disk
    if version.file_path:
        try:
            await delete_file(version.file_path)
        except Exception as e:
            # Log the error but proceed with database deletion
            print(f"Error deleting version file: {e}")

    # Delete the DB row
    await db.delete(version)
    await db.commit()

    return version
