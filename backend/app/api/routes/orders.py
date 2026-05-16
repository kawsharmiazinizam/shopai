# ============================================================
# backend/app/api/routes/orders.py — Order placement
# ============================================================
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Order, OrderItem, Cart, Product
from app.schemas.schemas import OrderCreate, OrderOut
from app.services.auth_service import get_current_user, get_admin_user

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.post("/", response_model=OrderOut, status_code=201)
def place_order(data: OrderCreate, db: Session = Depends(get_db),
                user=Depends(get_current_user)):
    cart_items = db.query(Cart).filter(Cart.user_id == user.id).all()
    if not cart_items:
        raise HTTPException(400, "Cart is empty")

    total = 0.0
    order_items = []
    for item in cart_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product or product.stock < item.quantity:
            raise HTTPException(400, f"Insufficient stock for {product.name if product else 'item'}")
        total += product.price * item.quantity
        order_items.append(OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            price=product.price
        ))
        product.stock -= item.quantity

    order = Order(user_id=user.id, total_amount=total,
                  address=data.address, phone=data.phone)
    db.add(order); db.flush()

    for oi in order_items:
        oi.order_id = order.id
        db.add(oi)

    db.query(Cart).filter(Cart.user_id == user.id).delete()
    db.commit(); db.refresh(order)
    return order

@router.get("/my", response_model=List[OrderOut])
def my_orders(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Order).filter(Order.user_id == user.id)\
             .order_by(Order.created_at.desc()).all()

@router.get("/all", response_model=List[OrderOut])
def all_orders(db: Session = Depends(get_db), _=Depends(get_admin_user)):
    return db.query(Order).order_by(Order.created_at.desc()).all()

@router.put("/{order_id}/status")
def update_status(order_id: int, status: str, db: Session = Depends(get_db),
                  _=Depends(get_admin_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order: raise HTTPException(404, "Order not found")
    order.status = status
    db.commit()
    return {"message": f"Status updated to {status}"}
