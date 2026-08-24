from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, require_admin
from app.models.user import User
from app.schemas.user import UserSchema, UserCreate, UserUpdate
from app.security import get_password_hash

router = APIRouter(prefix="/users", tags=["users"], dependencies=[Depends(require_admin)])


@router.get("/", response_model=List[UserSchema])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.post("/", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )
    user = User(
        nombre=user_in.nombre,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        rol=user_in.rol or "vendedor",
        activo=user_in.activo if user_in.activo is not None else True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{id}", response_model=UserSchema)
def get_user(id: UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/{id}", response_model=UserSchema)
def update_user(id: UUID, user_in: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user_in.email and user_in.email != user.email:
        existing = db.query(User).filter(User.email == user_in.email).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already taken")
        user.email = user_in.email

    if user_in.nombre is not None:
        user.nombre = user_in.nombre
    if user_in.password is not None:
        user.password_hash = get_password_hash(user_in.password)
    if user_in.rol is not None:
        user.rol = user_in.rol
    if user_in.activo is not None:
        user.activo = user_in.activo

    db.commit()
    db.refresh(user)
    return user


@router.delete("/{id}")
def delete_user(id: UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return {"ok": True}
