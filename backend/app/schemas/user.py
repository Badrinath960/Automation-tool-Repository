from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.user import UserRole


# --- Request Schemas ---

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=255)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None


class UserRoleUpdate(BaseModel):
    role: UserRole


# --- Response Schemas ---

class UserOut(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UserWithDownloads(UserOut):
    download_count: int = 0


# --- Auth Schemas ---

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str  # user UUID as string
    email: str
    role: str
    exp: Optional[int] = None
