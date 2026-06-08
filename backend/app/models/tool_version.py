import uuid
from sqlalchemy import String, Text, Boolean, BigInteger, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database import Base


class ToolVersion(Base):
    __tablename__ = "tool_versions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tool_id = mapped_column(
        UUID(as_uuid=True), ForeignKey("tools.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    version_number: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # e.g. "v1.0.0"
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_size_bytes = mapped_column(BigInteger, nullable=True)
    release_notes = mapped_column(Text, nullable=True)
    is_latest: Mapped[bool] = mapped_column(Boolean, default=False)
    uploaded_by = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    created_at = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Unique constraint: one version number per tool
    __table_args__ = (
        UniqueConstraint("tool_id", "version_number", name="uq_tool_version"),
    )

    # Relationships
    tool = relationship("Tool", back_populates="versions", lazy="selectin")
    uploader = relationship("User", lazy="selectin")
    download_logs = relationship(
        "DownloadLog", back_populates="tool_version", lazy="selectin"
    )
