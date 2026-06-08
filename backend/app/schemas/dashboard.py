from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.schemas.tool import CategoryOut


# --- Request Schemas ---

class DashboardCreate(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    embed_url: str = Field(..., max_length=1000)  # Power BI embed URL
    category_id: Optional[UUID] = None
    tags: Optional[List[str]] = None
    is_featured: bool = False


class DashboardUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    embed_url: Optional[str] = Field(None, max_length=1000)
    category_id: Optional[UUID] = None
    tags: Optional[List[str]] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None


# --- Response Schemas ---

class DashboardOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    embed_url: str
    thumbnail_path: Optional[str] = None
    category: Optional[CategoryOut] = None
    created_by: Optional[UUID] = None
    is_active: bool
    is_featured: bool
    tags: Optional[List[str]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PaginatedDashboards(BaseModel):
    items: List[DashboardOut]
    total: int
    page: int
    per_page: int
    pages: int
