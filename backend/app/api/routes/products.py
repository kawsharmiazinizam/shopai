# ============================================================
# backend/app/api/routes/products.py — Product CRUD + search
# ============================================================
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil, os, uuid
from app.core.database import get_db
from app.models.models import Product, Category
from app.schemas.schemas import ProductCreate, ProductUpdate, ProductOut
from app.services.auth_service import get_admin_user
from app.core.config import settings

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("/", response_model=List[ProductOut])
def list_products(
    skip: int = 0, limit: int = 20,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    featured: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Product).filter(Product.is_active == True)
    if category_id: q = q.filter(Product.category_id == category_id)
    if search:       q = q.filter(Product.name.ilike(f"%{search}%"))
    if min_price:    q = q.filter(Product.price >= min_price)
    if max_price:    q = q.filter(Product.price <= max_price)
    if featured is not None: q = q.filter(Product.is_featured == featured)
    return q.offset(skip).limit(limit).all()

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p: raise HTTPException(404, "Product not found")
    return p

@router.post("/", response_model=ProductOut, status_code=201)
def create_product(data: ProductCreate, db: Session = Depends(get_db),
                   _=Depends(get_admin_user)):
    if not db.query(Category).filter(Category.id == data.category_id).first():
        raise HTTPException(404, "Category not found")
    p = Product(**data.model_dump())
    db.add(p); db.commit(); db.refresh(p)
    return p

@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, data: ProductUpdate,
                   db: Session = Depends(get_db), _=Depends(get_admin_user)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p: raise HTTPException(404, "Product not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(p, k, v)
    db.commit(); db.refresh(p)
    return p

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db),
                   _=Depends(get_admin_user)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p: raise HTTPException(404, "Product not found")
    p.is_active = False
    db.commit()
    return {"message": "Product deleted"}

@router.post("/{product_id}/upload-image")
def upload_image(product_id: int, file: UploadFile = File(...),
                 db: Session = Depends(get_db), _=Depends(get_admin_user)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p: raise HTTPException(404, "Product not found")
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    p.image = f"/uploads/{filename}"
    db.commit()
    return {"image_url": p.image}
