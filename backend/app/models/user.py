import uuid
import enum
from sqlalchemy import String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database import Base


class UserRole(str, enum.Enum):
    """Enum for user roles."""
    user = "user"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="user_role", create_constraint=True),
        default=UserRole.user,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    last_login = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    tools = relationship("Tool", back_populates="creator", lazy="selectin")
    dashboards = relationship("Dashboard", back_populates="creator", lazy="selectin")
    download_logs = relationship("DownloadLog", back_populates="user", lazy="selectin")
