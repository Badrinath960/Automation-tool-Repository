from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class OverviewStats(BaseModel):
    total_tools: int
    total_dashboards: int
    total_users: int
    total_downloads: int


class DownloadTrend(BaseModel):
    date: str  # ISO date string (YYYY-MM-DD)
    count: int


class TopTool(BaseModel):
    tool_id: str
    tool_name: str
    download_count: int
    category: Optional[str] = None


class UserActivity(BaseModel):
    date: str
    new_users: int


class DownloadLogEntry(BaseModel):
    id: str
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    tool_name: Optional[str] = None
    version: Optional[str] = None
    downloaded_at: Optional[datetime] = None
    ip_address: Optional[str] = None
