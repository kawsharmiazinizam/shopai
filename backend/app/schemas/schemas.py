# ============================================================
# backend/app/schemas/schemas.py — Pydantic request/response
# ============================================================
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ── Auth ─────────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    is_admin: bool
    is_active: bool
    created_at: datetime
    class Config: from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# ── Category ─────────────────────────────────────────────────
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    image: Optional[str]
    class Config: from_attributes = True

# ── Product ──────────────────────────────────────────────────
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    stock: int = 0
    category_id: int
    brand: Optional[str] = None
    is_featured: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None

class ProductOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    original_price: Optional[float]
    stock: int
    image: Optional[str]
    brand: Optional[str]
    rating: float
    review_count: int
    is_featured: bool
    is_active: bool
    category: Optional[CategoryOut]
    created_at: datetime
    class Config: from_attributes = True

# ── Cart ─────────────────────────────────────────────────────
class CartAdd(BaseModel):
    product_id: int
    quantity: int = 1

class CartOut(BaseModel):
    id: int
    quantity: int
    product: ProductOut
    class Config: from_attributes = True

# ── Order ─────────────────────────────────────────────────────
class OrderCreate(BaseModel):
    address: str
    phone: str

class OrderItemOut(BaseModel):
    id: int
    quantity: int
    price: float
    product: ProductOut
    class Config: from_attributes = True

class OrderOut(BaseModel):
    id: int
    total_amount: float
    status: str
    address: Optional[str]
    phone: Optional[str]
    created_at: datetime
    items: List[OrderItemOut] = []
    class Config: from_attributes = True

# ── Review ───────────────────────────────────────────────────
class ReviewCreate(BaseModel):
    product_id: int
    rating: int
    comment: Optional[str] = None

class ReviewOut(BaseModel):
    id: int
    rating: int
    comment: Optional[str]
    sentiment: Optional[str]
    created_at: datetime
    user: UserOut
    class Config: from_attributes = True

# ── AI ───────────────────────────────────────────────────────
class AIDescRequest(BaseModel):
    product_name: str
    category: str
    brand: Optional[str] = None
    key_features: Optional[str] = None

class ChatMessage(BaseModel):
    message: str
    history: Optional[List[dict]] = []
