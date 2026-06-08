import uuid
from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database import Base


class DownloadLog(Base):
    __tablename__ = "download_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True
    )
    tool_id = mapped_column(
        UUID(as_uuid=True), ForeignKey("tools.id"), nullable=True, index=True
    )
    tool_version_id = mapped_column(
        UUID(as_uuid=True), ForeignKey("tool_versions.id"), nullable=True
    )
    downloaded_at = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    ip_address = mapped_column(String(45), nullable=True)
    user_agent = mapped_column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="download_logs", lazy="selectin")
    tool = relationship("Tool", back_populates="download_logs", lazy="selectin")
    tool_version = relationship("ToolVersion", back_populates="download_logs", lazy="selectin")
