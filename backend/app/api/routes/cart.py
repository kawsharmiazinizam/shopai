# ============================================================
# backend/app/api/routes/cart.py — Cart management
# ============================================================
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Cart, Product
from app.schemas.schemas import CartAdd, CartOut
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/cart", tags=["Cart"])

@router.get("/", response_model=List[CartOut])
def get_cart(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Cart).filter(Cart.user_id == user.id).all()

@router.post("/", response_model=CartOut, status_code=201)
def add_to_cart(data: CartAdd, db: Session = Depends(get_db),
                user=Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == data.product_id,
                                       Product.is_active == True).first()
    if not product: raise HTTPException(404, "Product not found")
    if product.stock < data.quantity:
        raise HTTPException(400, f"Only {product.stock} items in stock")

    existing = db.query(Cart).filter(Cart.user_id == user.id,
                                     Cart.product_id == data.product_id).first()
    if existing:
        existing.quantity += data.quantity
        db.commit(); db.refresh(existing)
        return existing

    item = Cart(user_id=user.id, product_id=data.product_id, quantity=data.quantity)
    db.add(item); db.commit(); db.refresh(item)
    return item

@router.put("/{item_id}")
def update_cart(item_id: int, quantity: int, db: Session = Depends(get_db),
                user=Depends(get_current_user)):
    item = db.query(Cart).filter(Cart.id == item_id,
                                 Cart.user_id == user.id).first()
    if not item: raise HTTPException(404, "Cart item not found")
    if quantity <= 0:
        db.delete(item); db.commit()
        return {"message": "Item removed"}
    item.quantity = quantity
    db.commit()
    return {"message": "Updated", "quantity": quantity}

@router.delete("/{item_id}")
def remove_from_cart(item_id: int, db: Session = Depends(get_db),
                     user=Depends(get_current_user)):
    item = db.query(Cart).filter(Cart.id == item_id,
                                 Cart.user_id == user.id).first()
    if not item: raise HTTPException(404, "Item not found")
    db.delete(item); db.commit()
    return {"message": "Removed from cart"}

@router.delete("/")
def clear_cart(db: Session = Depends(get_db), user=Depends(get_current_user)):
    db.query(Cart).filter(Cart.user_id == user.id).delete()
    db.commit()
    return {"message": "Cart cleared"}
