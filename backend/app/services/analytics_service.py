"""
Analytics service — aggregation queries for admin dashboard.
"""
import csv
import io
from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, cast, Date
from app.models.user import User
from app.models.tool import Tool
from app.models.dashboard import Dashboard
from app.models.download_log import DownloadLog
from app.models.category import Category


async def get_overview(db: AsyncSession) -> dict:
    """Get total counts for KPI cards."""
    # Total active tools
    tools_result = await db.execute(
        select(func.count(Tool.id)).where(Tool.is_active == True)
    )
    total_tools = tools_result.scalar() or 0

    # Total active dashboards
    dash_result = await db.execute(
        select(func.count(Dashboard.id)).where(Dashboard.is_active == True)
    )
    total_dashboards = dash_result.scalar() or 0

    # Total active users
    users_result = await db.execute(
        select(func.count(User.id)).where(User.is_active == True)
    )
    total_users = users_result.scalar() or 0

    # Total downloads
    downloads_result = await db.execute(
        select(func.count(DownloadLog.id))
    )
    total_downloads = downloads_result.scalar() or 0

    return {
        "total_tools": total_tools,
        "total_dashboards": total_dashboards,
        "total_users": total_users,
        "total_downloads": total_downloads,
    }


async def get_download_trend(
    db: AsyncSession,
    days: int = 30,
) -> list:
    """Get daily download counts for the last N days."""
    start_date = datetime.now(timezone.utc) - timedelta(days=days)

    result = await db.execute(
        select(
            cast(DownloadLog.downloaded_at, Date).label("date"),
            func.count(DownloadLog.id).label("count"),
        )
        .where(DownloadLog.downloaded_at >= start_date)
        .group_by(cast(DownloadLog.downloaded_at, Date))
        .order_by(cast(DownloadLog.downloaded_at, Date))
    )

    rows = result.all()

    # Fill in missing dates with 0 counts
    trend = []
    current = start_date.date()
    end = datetime.now(timezone.utc).date()
    row_dict = {str(row.date): row.count for row in rows}

    while current <= end:
        date_str = str(current)
        trend.append({
            "date": date_str,
            "count": row_dict.get(date_str, 0),
        })
        current += timedelta(days=1)

    return trend


async def get_top_tools(
    db: AsyncSession,
    limit: int = 10,
) -> list:
    """Get top downloaded tools."""
    result = await db.execute(
        select(
            Tool.id,
            Tool.name,
            Tool.category_id,
            func.count(DownloadLog.id).label("download_count"),
        )
        .join(DownloadLog, DownloadLog.tool_id == Tool.id)
        .where(Tool.is_active == True)
        .group_by(Tool.id, Tool.name, Tool.category_id)
        .order_by(func.count(DownloadLog.id).desc())
        .limit(limit)
    )

    rows = result.all()

    items = []
    for row in rows:
        # Get category name
        cat_name = None
        if row.category_id:
            cat_result = await db.execute(
                select(Category.name).where(Category.id == row.category_id)
            )
            cat_name = cat_result.scalar()

        items.append({
            "tool_id": str(row.id),
            "tool_name": row.name,
            "download_count": row.download_count,
            "category": cat_name,
        })

    return items


async def get_user_registrations(
    db: AsyncSession,
    days: int = 30,
) -> list:
    """Get daily new user registration counts for the last N days."""
    start_date = datetime.now(timezone.utc) - timedelta(days=days)

    result = await db.execute(
        select(
            cast(User.created_at, Date).label("date"),
            func.count(User.id).label("new_users"),
        )
        .where(User.created_at >= start_date)
        .group_by(cast(User.created_at, Date))
        .order_by(cast(User.created_at, Date))
    )

    rows = result.all()

    # Fill missing dates
    trend = []
    current = start_date.date()
    end = datetime.now(timezone.utc).date()
    row_dict = {str(row.date): row.new_users for row in rows}

    while current <= end:
        date_str = str(current)
        trend.append({
            "date": date_str,
            "new_users": row_dict.get(date_str, 0),
        })
        current += timedelta(days=1)

    return trend


async def get_download_logs(
    db: AsyncSession,
    limit: int = 20,
) -> list:
    """Get recent download logs for admin dashboard table."""
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(DownloadLog)
        .options(
            selectinload(DownloadLog.user),
            selectinload(DownloadLog.tool),
            selectinload(DownloadLog.tool_version),
        )
        .order_by(DownloadLog.downloaded_at.desc())
        .limit(limit)
    )

    logs = result.scalars().unique().all()

    items = []
    for log in logs:
        items.append({
            "id": str(log.id),
            "user_email": log.user.email if log.user else None,
            "user_name": log.user.full_name if log.user else None,
            "tool_name": log.tool.name if log.tool else None,
            "version": log.tool_version.version_number if log.tool_version else None,
            "downloaded_at": log.downloaded_at,
            "ip_address": log.ip_address,
        })

    return items


async def export_download_csv(
    db: AsyncSession,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> str:
    """Export download logs as CSV string."""
    from sqlalchemy.orm import selectinload

    query = (
        select(DownloadLog)
        .options(
            selectinload(DownloadLog.user),
            selectinload(DownloadLog.tool),
            selectinload(DownloadLog.tool_version),
        )
        .order_by(DownloadLog.downloaded_at.desc())
    )

    if start_date:
        query = query.where(DownloadLog.downloaded_at >= start_date)
    if end_date:
        query = query.where(DownloadLog.downloaded_at <= end_date)

    result = await db.execute(query)
    logs = result.scalars().unique().all()

    # Generate CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Download ID", "User Email", "User Name", "Tool Name",
        "Version", "Downloaded At", "IP Address", "User Agent",
    ])

    for log in logs:
        writer.writerow([
            str(log.id),
            log.user.email if log.user else "",
            log.user.full_name if log.user else "",
            log.tool.name if log.tool else "",
            log.tool_version.version_number if log.tool_version else "",
            log.downloaded_at.isoformat() if log.downloaded_at else "",
            log.ip_address or "",
            log.user_agent or "",
        ])

    return output.getvalue()
