# ============================================================
# backend/app/api/routes/wishlist.py — Wishlist feature
# ============================================================
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Wishlist, Product
from app.schemas.schemas import ProductOut
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])

@router.get("/")
def get_wishlist(db: Session = Depends(get_db), user=Depends(get_current_user)):
    items = db.query(Wishlist).filter(Wishlist.user_id == user.id).all()
    return [{"id": w.id, "product": w.product} for w in items]

@router.post("/{product_id}")
def add_to_wishlist(product_id: int, db: Session = Depends(get_db),
                    user=Depends(get_current_user)):
    if not db.query(Product).filter(Product.id == product_id).first():
        raise HTTPException(404, "Product not found")
    existing = db.query(Wishlist).filter(
        Wishlist.user_id == user.id, Wishlist.product_id == product_id).first()
    if existing:
        return {"message": "Already in wishlist"}
    w = Wishlist(user_id=user.id, product_id=product_id)
    db.add(w); db.commit()
    return {"message": "Added to wishlist"}

@router.delete("/{product_id}")
def remove_from_wishlist(product_id: int, db: Session = Depends(get_db),
                         user=Depends(get_current_user)):
    w = db.query(Wishlist).filter(
        Wishlist.user_id == user.id, Wishlist.product_id == product_id).first()
    if not w:
        raise HTTPException(404, "Not in wishlist")
    db.delete(w); db.commit()
    return {"message": "Removed from wishlist"}
