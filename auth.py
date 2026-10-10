from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from backend.app.db.database import get_db
from backend.app.db.models import User, Student
from backend.app.core.security import verify_password, get_password_hash, create_access_token
from backend.app.core.config import settings
from backend.app.schemas.models import Token, UserLogin, UserRegister
from backend.app.api.deps import get_current_user

router = APIRouter()

@router.post("/login", response_model=Token)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return JWT bearer token.
    """
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token(
        subject=user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role
    }

@router.post("/register", response_model=Token)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    """
    Register a new student account.
    """
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already registered")

    new_user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role or "student"
    )
    db.add(new_user)
    db.flush()

    if new_user.role == "student":
        roll_num = user_data.roll_number or f"26CS{str(new_user.id)[:3]}"
        new_student = Student(
            user_id=new_user.id,
            roll_number=roll_num,
            full_name=user_data.full_name,
            department=user_data.department or "School of Computing",
            semester="Semester 6 (Spring 2026)"
        )
        db.add(new_student)

    db.commit()

    access_token = create_access_token(subject=new_user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": new_user.id,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "role": new_user.role
    }

@router.get("/me")
def get_auth_profile(current_user: User = Depends(get_current_user)):
    """
    Get profile information for current authenticated user.
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "avatar": current_user.avatar
    }
