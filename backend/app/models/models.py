# ============================================================
# backend/app/models/  — All SQLAlchemy ORM models
# ============================================================
from sqlalchemy import (Column, Integer, String, Float, Boolean,
                        ForeignKey, Text, DateTime, Enum as SAEnum)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import enum

# ── Enums ────────────────────────────────────────────────────
class OrderStatus(str, enum.Enum):
    pending   = "pending"
    confirmed = "confirmed"
    shipped   = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"

# ── User ─────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(100), nullable=False)
    email         = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin      = Column(Boolean, default=False)
    is_active     = Column(Boolean, default=True)
    avatar        = Column(String, nullable=True)
    created_at    = Column(DateTime, default=datetime.utcnow)

    orders        = relationship("Order",   back_populates="user")
    cart_items    = relationship("Cart",    back_populates="user")
    reviews       = relationship("Review",  back_populates="user")
    wishlist      = relationship("Wishlist", back_populates="user")

# ── Category ─────────────────────────────────────────────────
class Category(Base):
    __tablename__ = "categories"
    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    image       = Column(String, nullable=True)
    products    = relationship("Product", back_populates="category")

# ── Product ──────────────────────────────────────────────────
class Product(Base):
    __tablename__ = "products"
    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(200), nullable=False)
    description   = Column(Text, nullable=True)
    price         = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    stock         = Column(Integer, default=0)
    image         = Column(String, nullable=True)
    category_id   = Column(Integer, ForeignKey("categories.id"))
    brand         = Column(String(100), nullable=True)
    rating        = Column(Float, default=0.0)
    review_count  = Column(Integer, default=0)
    is_featured   = Column(Boolean, default=False)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime, default=datetime.utcnow)

    category      = relationship("Category", back_populates="products")
    reviews       = relationship("Review",   back_populates="product")
    order_items   = relationship("OrderItem", back_populates="product")
    cart_items    = relationship("Cart",      back_populates="product")
    wishlist      = relationship("Wishlist",  back_populates="product")

# ── Order ─────────────────────────────────────────────────────
class Order(Base):
    __tablename__ = "orders"
    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id"))
    total_amount  = Column(Float, nullable=False)
    status        = Column(SAEnum(OrderStatus), default=OrderStatus.pending)
    address       = Column(Text, nullable=True)
    phone         = Column(String(20), nullable=True)
    created_at    = Column(DateTime, default=datetime.utcnow)

    user          = relationship("User",      back_populates="orders")
    items         = relationship("OrderItem", back_populates="order")

# ── OrderItem ─────────────────────────────────────────────────
class OrderItem(Base):
    __tablename__ = "order_items"
    id         = Column(Integer, primary_key=True, index=True)
    order_id   = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity   = Column(Integer, nullable=False)
    price      = Column(Float, nullable=False)

    order      = relationship("Order",   back_populates="items")
    product    = relationship("Product", back_populates="order_items")

# ── Cart ──────────────────────────────────────────────────────
class Cart(Base):
    __tablename__ = "cart"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity   = Column(Integer, default=1)

    user       = relationship("User",    back_populates="cart_items")
    product    = relationship("Product", back_populates="cart_items")

# ── Review ────────────────────────────────────────────────────
class Review(Base):
    __tablename__ = "reviews"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    rating     = Column(Integer, nullable=False)
    comment    = Column(Text, nullable=True)
    sentiment  = Column(String(20), nullable=True)   # positive/negative/neutral
    created_at = Column(DateTime, default=datetime.utcnow)

    user       = relationship("User",    back_populates="reviews")
    product    = relationship("Product", back_populates="reviews")

# ── Wishlist ──────────────────────────────────────────────────
class Wishlist(Base):
    __tablename__ = "wishlist"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))

    user       = relationship("User",    back_populates="wishlist")
    product    = relationship("Product", back_populates="wishlist")
