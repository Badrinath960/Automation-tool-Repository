from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db, get_current_user
from app.schemas.user import UserCreate, UserLogin, UserOut, Token
from app.services.auth_service import register_user, authenticate_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user account."""
    user = await register_user(db, user_data)
    return {
        "success": True,
        "data": UserOut.model_validate(user).model_dump(),
        "message": "User registered successfully",
    }


@router.post("/login", response_model=dict)
async def login(
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """Login with email and password, returns JWT token."""
    token = await authenticate_user(db, login_data)
    return {
        "success": True,
        "data": token.model_dump(),
        "message": "Login successful",
    }


@router.get("/me", response_model=dict)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """Get current authenticated user info."""
    return {
        "success": True,
        "data": UserOut.model_validate(current_user).model_dump(),
    }
