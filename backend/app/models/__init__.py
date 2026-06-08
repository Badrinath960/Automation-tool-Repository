# Import all models so Alembic and SQLAlchemy can discover them
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.tool import Tool
from app.models.tool_version import ToolVersion
from app.models.dashboard import Dashboard
from app.models.download_log import DownloadLog

__all__ = [
    "User",
    "UserRole",
    "Category",
    "Tool",
    "ToolVersion",
    "Dashboard",
    "DownloadLog",
]
