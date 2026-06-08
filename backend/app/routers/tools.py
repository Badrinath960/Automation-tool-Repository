"""
Tools router — CRUD, versioning, downloads.
"""
import uuid
from typing import Optional, List
from pathlib import Path
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, Request
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db, get_current_user, require_admin
from app.models.user import User
from app.services import tool_service

router = APIRouter(prefix="/api/tools", tags=["Tools"])


@router.get("", response_model=dict)
async def list_tools(
    search: Optional[str] = Query(None),
    category_id: Optional[uuid.UUID] = Query(None),
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    sort_by: str = Query("newest", regex="^(newest|name|downloads)$"),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """List tools with search, filters, and pagination."""
    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else None
    data = await tool_service.get_tools(
        db, search=search, category_id=category_id,
        tags=tag_list, sort_by=sort_by, page=page, per_page=per_page,
    )
    return {"success": True, "data": data}


@router.get("/categories", response_model=dict)
async def list_categories(db: AsyncSession = Depends(get_db)):
    """List all tool categories."""
    categories = await tool_service.get_categories(db)
    return {"success": True, "data": categories}


@router.get("/{tool_id}", response_model=dict)
async def get_tool(
    tool_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get full tool detail by ID."""
    data = await tool_service.get_tool_by_id(db, tool_id)
    return {"success": True, "data": data}


@router.post("", response_model=dict, status_code=201)
async def create_tool(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    long_description: Optional[str] = Form(None),
    category_id: Optional[uuid.UUID] = Form(None),
    tags: Optional[str] = Form(None),
    is_featured: bool = Form(False),
    dependencies: Optional[str] = Form(None),
    documentation: Optional[str] = Form(None),
    version_number: str = Form(...),
    release_notes: Optional[str] = Form(None),
    zip_file: UploadFile = File(...),
    thumbnail: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] Create a new tool with ZIP upload."""
    from app.schemas.tool import ToolCreate
    import json

    # Parse tags from comma-separated string
    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else None

    # Parse dependencies from JSON string
    deps = None
    if dependencies:
        try:
            deps = json.loads(dependencies)
        except json.JSONDecodeError:
            deps = {"packages": [d.strip() for d in dependencies.split(",") if d.strip()]}

    tool_data = ToolCreate(
        name=name,
        description=description,
        long_description=long_description,
        category_id=category_id,
        tags=tag_list,
        is_featured=is_featured,
        dependencies=deps,
        documentation=documentation,
    )

    tool = await tool_service.create_tool(
        db, tool_data, zip_file, version_number,
        release_notes, current_user.id,
        thumbnail=thumbnail if thumbnail and thumbnail.filename else None,
    )

    return {
        "success": True,
        "data": {"id": str(tool.id), "name": tool.name, "slug": tool.slug},
        "message": f"Tool '{tool.name}' created successfully",
    }


@router.put("/{tool_id}", response_model=dict)
async def update_tool(
    tool_id: uuid.UUID,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    long_description: Optional[str] = Form(None),
    category_id: Optional[uuid.UUID] = Form(None),
    tags: Optional[str] = Form(None),
    is_featured: Optional[bool] = Form(None),
    is_active: Optional[bool] = Form(None),
    dependencies: Optional[str] = Form(None),
    documentation: Optional[str] = Form(None),
    thumbnail: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] Update tool metadata."""
    from app.schemas.tool import ToolUpdate
    from app.utils.file_handler import save_thumbnail
    import json

    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else None
    deps = None
    if dependencies:
        try:
            deps = json.loads(dependencies)
        except json.JSONDecodeError:
            deps = {"packages": [d.strip() for d in dependencies.split(",") if d.strip()]}

    update_data = ToolUpdate(
        name=name,
        description=description,
        long_description=long_description,
        category_id=category_id,
        tags=tag_list,
        is_featured=is_featured,
        is_active=is_active,
        dependencies=deps,
        documentation=documentation,
    )

    tool = await tool_service.update_tool(db, tool_id, update_data)

    # Update thumbnail if provided
    if thumbnail and thumbnail.filename:
        thumb_path = await save_thumbnail(thumbnail, "tool", tool.id)
        tool.thumbnail_path = thumb_path
        await db.commit()

    return {
        "success": True,
        "data": {"id": str(tool.id), "name": tool.name},
        "message": f"Tool '{tool.name}' updated successfully",
    }


@router.delete("/{tool_id}", response_model=dict)
async def delete_tool(
    tool_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] Soft delete a tool."""
    tool = await tool_service.delete_tool(db, tool_id)
    return {
        "success": True,
        "message": f"Tool '{tool.name}' deactivated",
    }


@router.post("/{tool_id}/version", response_model=dict, status_code=201)
async def upload_version(
    tool_id: uuid.UUID,
    version_number: str = Form(...),
    release_notes: Optional[str] = Form(None),
    zip_file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """[ADMIN] Upload a new version for an existing tool."""
    version = await tool_service.add_version(
        db, tool_id, zip_file, version_number,
        release_notes, current_user.id,
    )
    return {
        "success": True,
        "data": {
            "id": str(version.id),
            "version_number": version.version_number,
            "file_size_bytes": version.file_size_bytes,
        },
        "message": f"Version {version.version_number} uploaded successfully",
    }


@router.get("/{tool_id}/download")
async def download_tool(
    tool_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download the latest version ZIP (logs download event)."""
    version = await tool_service.get_download_file(db, tool_id)

    # Log download
    await tool_service.log_download(
        db,
        user_id=current_user.id,
        tool_id=tool_id,
        version_id=version.id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    file_path = Path(version.file_path)
    if not file_path.exists():
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server",
        )

    return FileResponse(
        path=str(file_path),
        filename=file_path.name,
        media_type="application/zip",
    )


@router.get("/{tool_id}/versions/{version_number}/download")
async def download_specific_version(
    tool_id: uuid.UUID,
    version_number: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download a specific version ZIP."""
    version = await tool_service.get_download_file(db, tool_id, version_number)

    # Log download
    await tool_service.log_download(
        db,
        user_id=current_user.id,
        tool_id=tool_id,
        version_id=version.id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    file_path = Path(version.file_path)
    if not file_path.exists():
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server",
        )

    return FileResponse(
        path=str(file_path),
        filename=file_path.name,
        media_type="application/zip",
    )
