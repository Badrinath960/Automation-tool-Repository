"""
File handling utilities for ZIP uploads and thumbnail images.
"""
import os
import uuid
import aiofiles
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from app.config import get_settings

settings = get_settings()

# ZIP magic bytes (PK\x03\x04)
ZIP_MAGIC_BYTES = b"PK\x03\x04"


async def validate_zip(file: UploadFile) -> None:
    """
    Validate that an uploaded file is a genuine ZIP archive.
    Checks both file extension and magic bytes.
    """
    # Check extension
    if not file.filename or not file.filename.lower().endswith(".zip"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Only .zip files are allowed",
        )

    # Check magic bytes
    header = await file.read(4)
    file.file.seek(0)  # Reset file position
    if header[:4] != ZIP_MAGIC_BYTES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="File is not a valid ZIP archive",
        )

    # Check file size
    file.file.seek(0, 2)  # Seek to end
    size = file.file.tell()
    file.file.seek(0)  # Reset
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit",
        )


async def save_zip_file(
    file: UploadFile,
    tool_id: uuid.UUID,
    version: str,
) -> tuple[str, int]:
    """
    Save a ZIP file to uploads/tools/{tool_id}/.
    Returns (relative_path, file_size_bytes).
    """
    tool_dir = Path(settings.UPLOAD_DIR) / "tools" / str(tool_id)
    tool_dir.mkdir(parents=True, exist_ok=True)

    # Sanitize filename
    safe_name = _sanitize_filename(file.filename or "tool.zip")
    filename = f"{version}_{safe_name}"
    file_path = tool_dir / filename

    # Write file
    content = await file.read()
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    file_size = len(content)
    relative_path = str(file_path).replace("\\", "/")

    return relative_path, file_size


async def save_thumbnail(
    file: UploadFile,
    prefix: str,
    entity_id: uuid.UUID,
) -> str:
    """
    Save a thumbnail image to uploads/thumbnails/.
    prefix should be 'tool' or 'dash'.
    Returns relative path.
    """
    # Validate image type
    allowed_extensions = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
    ext = ""
    if file.filename:
        ext = Path(file.filename).suffix.lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Image must be one of: {', '.join(allowed_extensions)}",
        )

    # Check size (max 2MB for thumbnails)
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if size > 2 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Thumbnail must be under 2MB",
        )

    thumb_dir = Path(settings.UPLOAD_DIR) / "thumbnails"
    thumb_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{prefix}_{entity_id}{ext}"
    file_path = thumb_dir / filename

    content = await file.read()
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    return str(file_path).replace("\\", "/")


async def delete_file(path: str) -> bool:
    """Safely delete a file. Returns True if deleted, False if not found."""
    try:
        file_path = Path(path)
        if file_path.exists():
            os.remove(file_path)
            return True
        return False
    except OSError:
        return False


def get_file_size(path: str) -> int:
    """Get file size in bytes. Returns 0 if file not found."""
    try:
        return os.path.getsize(path)
    except OSError:
        return 0


def _sanitize_filename(filename: str) -> str:
    """Remove path traversal characters and sanitize filename."""
    # Remove directory components
    name = Path(filename).name
    # Remove potentially dangerous characters
    safe_chars = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-")
    sanitized = "".join(c if c in safe_chars else "_" for c in name)
    return sanitized or "file.zip"
