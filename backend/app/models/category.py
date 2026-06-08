import uuid
from sqlalchemy import String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description = mapped_column(Text, nullable=True)
    icon: Mapped[str] = mapped_column(
        String(50), nullable=True
    )  # Lucide icon name string
    created_at = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    tools = relationship("Tool", back_populates="category", lazy="selectin")
    dashboards = relationship("Dashboard", back_populates="category", lazy="selectin")
