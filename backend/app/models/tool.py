import uuid
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database import Base


class Tool(Base):
    __tablename__ = "tools"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    description = mapped_column(String(500), nullable=True)
    long_description = mapped_column(Text, nullable=True)
    category_id = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True, index=True
    )
    created_by = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    thumbnail_path = mapped_column(String(500), nullable=True)
    tags = mapped_column(ARRAY(String), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    dependencies = mapped_column(JSONB, nullable=True)  # {"packages": ["pandas", ...]}
    documentation = mapped_column(Text, nullable=True)  # Markdown string
    documentation_pdf_path = mapped_column(String(500), nullable=True)  # Path to uploaded detailed PDF guide
    created_at = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )

    # Relationships
    category = relationship("Category", back_populates="tools", lazy="selectin")
    creator = relationship("User", back_populates="tools", lazy="selectin")
    versions = relationship(
        "ToolVersion", back_populates="tool", lazy="selectin",
        cascade="all, delete-orphan", order_by="ToolVersion.created_at.desc()"
    )
    download_logs = relationship(
        "DownloadLog", back_populates="tool", lazy="selectin",
        cascade="all, delete-orphan"
    )
