"""
Seed script for ATR — creates default admin, categories, and sample tools.

Usage:
    cd backend
    python seed.py
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import async_session_factory, engine, Base
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.tool import Tool
from app.models.tool_version import ToolVersion
from app.utils.security import hash_password
from app.config import get_settings

settings = get_settings()


# Default categories with Lucide icon names
DEFAULT_CATEGORIES = [
    {"name": "Data Processing", "description": "Tools for processing and transforming data", "icon": "database"},
    {"name": "Automation", "description": "Workflow and task automation scripts", "icon": "zap"},
]

# Sample tools for demo
SAMPLE_TOOLS = [
    {
        "name": "EAN Barcode Finder",
        "slug": "ean-barcode-finder",
        "description": "Automated tool for finding and validating EAN barcodes via web scraping.",
        "long_description": "This tool automates the process of finding EAN barcodes for products using web scraping techniques. It searches multiple online databases and validates the found barcodes against standard EAN-13 checksum algorithms.",
        "category_name": "Automation",
        "tags": ["barcode", "ean", "web-scraping"],
        "is_featured": True,
        "dependencies": {"packages": ["playwright", "duckduckgo-search", "python-dotenv"]},
        "documentation": "# EAN Barcode Finder\n\n## Setup\n1. Install dependencies: `pip install playwright duckduckgo-search python-dotenv`\n2. Run `playwright install chromium`\n\n## Usage\n```python\nfrom barcode_finder import find_ean\nresult = find_ean('product_name')\nprint(result)\n```\n\n## Output\nReturns a dictionary with `ean`, `source`, and `confidence` fields.",
        "version": "v1.0.0",
        "release_notes": "Initial release with basic barcode lookup functionality.",
    },
    {
        "name": "Sales Data Processor",
        "slug": "sales-data-processor",
        "description": "ETL pipeline for cleaning, transforming, and analyzing sales CSV data.",
        "long_description": "A comprehensive ETL (Extract, Transform, Load) pipeline designed for processing raw sales data from CSV files. Handles data cleaning, deduplication, currency normalization, and generates summary reports.",
        "category_name": "Data Processing",
        "tags": ["csv", "pandas", "sales", "etl"],
        "is_featured": True,
        "dependencies": {"packages": ["pandas", "openpyxl", "numpy"]},
        "documentation": "# Sales Data Processor\n\n## Setup\n1. Install dependencies: `pip install pandas openpyxl numpy`\n\n## Usage\n```python\nfrom processor import SalesProcessor\nsp = SalesProcessor('sales_data.csv')\nsp.clean()\nsp.transform()\nsp.export('output.xlsx')\n```\n\n## Features\n- Automatic date parsing\n- Currency normalization\n- Duplicate detection\n- Summary statistics",
        "version": "v2.1.0",
        "release_notes": "Added multi-currency support and improved date parsing.",
    },
    {
        "name": "Power BI Report Exporter",
        "slug": "power-bi-report-exporter",
        "description": "Automates exporting Power BI reports to PDF and Excel formats.",
        "long_description": "Automates the process of exporting Power BI reports and dashboards to various formats including PDF, Excel, and PowerPoint. Supports scheduled exports and email distribution.",
        "category_name": "Automation",
        "tags": ["power-bi", "export", "pdf"],
        "is_featured": False,
        "dependencies": {"packages": ["requests", "pdfkit"]},
        "documentation": "# Power BI Report Exporter\n\n## Prerequisites\n- Power BI Service account with API access\n- wkhtmltopdf installed for PDF generation\n\n## Setup\n1. Install: `pip install requests pdfkit`\n2. Configure `.env` with your Power BI credentials\n\n## Usage\n```python\nfrom exporter import PBIExporter\nexporter = PBIExporter()\nexporter.export_to_pdf('report_id', 'output.pdf')\n```",
        "version": "v1.2.0",
        "release_notes": "Added Excel export support and improved error handling.",
    },
]


async def seed():
    """Run the seed script."""
    async with async_session_factory() as db:
        print("[SEED] Starting ATR seed process...\n")

        # --- 1. Seed Admin User ---
        result = await db.execute(
            select(User).where(User.email == settings.ADMIN_EMAIL)
        )
        admin = result.scalar_one_or_none()

        if admin:
            print(f"[OK] Admin user already exists: {settings.ADMIN_EMAIL}")
        else:
            admin = User(
                email=settings.ADMIN_EMAIL,
                password_hash=hash_password(settings.ADMIN_PASSWORD),
                full_name="System Admin",
                role=UserRole.admin,
                is_active=True,
            )
            db.add(admin)
            await db.commit()
            await db.refresh(admin)
            print(f"[OK] Created admin user: {settings.ADMIN_EMAIL}")

        # --- 2. Seed Categories ---
        categories = {}
        for cat_data in DEFAULT_CATEGORIES:
            result = await db.execute(
                select(Category).where(Category.name == cat_data["name"])
            )
            cat = result.scalar_one_or_none()
            if cat:
                print(f"[OK] Category already exists: {cat_data['name']}")
                categories[cat_data["name"]] = cat
            else:
                cat = Category(**cat_data)
                db.add(cat)
                await db.commit()
                await db.refresh(cat)
                categories[cat_data["name"]] = cat
                print(f"[OK] Created category: {cat_data['name']}")

        # --- 3. Seed Sample Tools ---
        for tool_data in SAMPLE_TOOLS:
            result = await db.execute(
                select(Tool).where(Tool.slug == tool_data["slug"])
            )
            existing_tool = result.scalar_one_or_none()
            if existing_tool:
                print(f"[OK] Tool already exists: {tool_data['name']}")
                continue

            category = categories.get(tool_data["category_name"])
            tool = Tool(
                name=tool_data["name"],
                slug=tool_data["slug"],
                description=tool_data["description"],
                long_description=tool_data["long_description"],
                category_id=category.id if category else None,
                created_by=admin.id,
                tags=tool_data["tags"],
                is_featured=tool_data["is_featured"],
                dependencies=tool_data["dependencies"],
                documentation=tool_data["documentation"],
                is_active=True,
            )
            db.add(tool)
            await db.commit()
            await db.refresh(tool)

            # Create initial version (no actual file — placeholder path)
            version = ToolVersion(
                tool_id=tool.id,
                version_number=tool_data["version"],
                file_path=f"uploads/tools/{tool.id}/{tool_data['version']}_placeholder.zip",
                file_size_bytes=0,
                release_notes=tool_data["release_notes"],
                is_latest=True,
                uploaded_by=admin.id,
            )
            db.add(version)
            await db.commit()
            print(f"[OK] Created tool: {tool_data['name']} ({tool_data['version']})")

        print("\n[DONE] Seed process complete!")


if __name__ == "__main__":
    asyncio.run(seed())
