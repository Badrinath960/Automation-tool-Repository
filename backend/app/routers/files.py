"""
Files router — serve uploaded static files (thumbnails, etc).
"""
from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse

router = APIRouter(prefix="/api/files", tags=["Files"])


@router.get("/uploads/{file_type}/{filename}")
async def serve_uploaded_file(file_type: str, filename: str):
    """
    Serve uploaded files (thumbnails, tool files).
    file_type: 'thumbnails' or 'tools'
    """
    # Validate file_type to prevent directory traversal
    allowed_types = {"thumbnails", "tools"}
    if file_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid file type",
        )

    # Sanitize filename
    safe_filename = Path(filename).name
    if safe_filename != filename or ".." in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename",
        )

    file_path = Path("uploads") / file_type / safe_filename

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    return FileResponse(str(file_path))


@router.get("/uploads/tools/{tool_id}/{filename}")
async def serve_tool_file(tool_id: str, filename: str):
    """Serve tool ZIP files from nested tool directories."""
    # Sanitize
    safe_tool_id = Path(tool_id).name
    safe_filename = Path(filename).name

    file_path = Path("uploads") / "tools" / safe_tool_id / safe_filename

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )

    return FileResponse(
        str(file_path),
        media_type="application/zip",
        filename=safe_filename,
    )
