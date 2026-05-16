# ============================================================
# backend/app/api/routes/categories.py — Category CRUD
# ============================================================
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Category
from app.schemas.schemas import CategoryCreate, CategoryOut
from app.services.auth_service import get_admin_user

router = APIRouter(prefix="/api/categories", tags=["Categories"])

@router.get("/", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.get("/{category_id}", response_model=CategoryOut)
def get_category(category_id: int, db: Session = Depends(get_db)):
    c = db.query(Category).filter(Category.id == category_id).first()
    if not c:
        raise HTTPException(404, "Category not found")
    return c

@router.post("/", response_model=CategoryOut, status_code=201)
def create_category(data: CategoryCreate, db: Session = Depends(get_db),
                    _=Depends(get_admin_user)):
    if db.query(Category).filter(Category.name == data.name).first():
        raise HTTPException(400, "Category already exists")
    c = Category(**data.model_dump())
    db.add(c); db.commit(); db.refresh(c)
    return c

@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db),
                    _=Depends(get_admin_user)):
    c = db.query(Category).filter(Category.id == category_id).first()
    if not c:
        raise HTTPException(404, "Category not found")
    db.delete(c); db.commit()
    return {"message": "Category deleted"}
