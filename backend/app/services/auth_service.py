from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserLogin, Token
from app.utils.security import hash_password, verify_password, create_access_token


async def register_user(db: AsyncSession, user_data: UserCreate) -> User:
    """Register a new user. Raises 409 if email already exists."""
    # Check for duplicate email
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create user
    new_user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name,
        role=UserRole.user,
        is_active=True,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


async def authenticate_user(db: AsyncSession, login_data: UserLogin) -> Token:
    """Authenticate user and return JWT token. Raises 401 on failure."""
    result = await db.execute(
        select(User).where(User.email == login_data.email)
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated",
        )

    # Update last_login timestamp
    user.last_login = datetime.now(timezone.utc)
    await db.commit()

    # Generate JWT
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
        }
    )

    return Token(access_token=access_token, token_type="bearer")
