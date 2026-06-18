from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime


# --- Request Schemas ---

class ToolCreate(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    long_description: Optional[str] = None
    category_id: Optional[UUID] = None
    tags: Optional[List[str]] = None
    is_featured: bool = False
    dependencies: Optional[Dict[str, Any]] = None  # {"packages": [...]}
    documentation: Optional[str] = None  # Markdown string


class ToolUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    long_description: Optional[str] = None
    category_id: Optional[UUID] = None
    tags: Optional[List[str]] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    dependencies: Optional[Dict[str, Any]] = None
    documentation: Optional[str] = None


class VersionCreate(BaseModel):
    version_number: str = Field(..., max_length=50)  # e.g. "v1.0.0"
    release_notes: Optional[str] = None


# --- Response Schemas ---

class CategoryOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None

    model_config = {"from_attributes": True}


class VersionOut(BaseModel):
    id: UUID
    tool_id: UUID
    version_number: str
    file_path: str
    file_size_bytes: Optional[int] = None
    release_notes: Optional[str] = None
    is_latest: bool
    uploaded_by: Optional[UUID] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ToolListItem(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    category: Optional[CategoryOut] = None
    thumbnail_path: Optional[str] = None
    tags: Optional[List[str]] = None
    is_active: bool
    is_featured: bool
    download_count: int = 0
    latest_version: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ToolOut(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    long_description: Optional[str] = None
    category: Optional[CategoryOut] = None
    created_by: Optional[UUID] = None
    thumbnail_path: Optional[str] = None
    tags: Optional[List[str]] = None
    is_active: bool
    is_featured: bool
    dependencies: Optional[Dict[str, Any]] = None
    documentation: Optional[str] = None
    documentation_pdf_path: Optional[str] = None
    versions: List[VersionOut] = []
    download_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# --- Paginated Response ---

class PaginatedTools(BaseModel):
    items: List[ToolListItem]
    total: int
    page: int
    per_page: int
    pages: int
