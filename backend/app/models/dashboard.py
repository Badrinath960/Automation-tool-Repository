import uuid
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database import Base


class Dashboard(Base):
    __tablename__ = "dashboards"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description = mapped_column(Text, nullable=True)
    embed_url: Mapped[str] = mapped_column(
        String(1000), nullable=False
    )  # Power BI embed URL
    thumbnail_path = mapped_column(String(500), nullable=True)
    category_id = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True
    )
    created_by = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    tags = mapped_column(ARRAY(String), nullable=True)
    created_at = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )

    # Relationships
    category = relationship("Category", back_populates="dashboards", lazy="selectin")
    creator = relationship("User", back_populates="dashboards", lazy="selectin")
