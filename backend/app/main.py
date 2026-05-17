# ============================================================
# backend/app/main.py â€” FastAPI application entry point
# ============================================================
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.database import engine, Base
from app.core.config import settings
from app.api.routes import auth, products, cart, orders
from app.api.routes import categories, reviews, wishlist, ai_routes
import os

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ShopAI - AI Powered E-commerce",
    description="Full-stack AI E-commerce with Claude AI integration",
    version="1.0.0"
)

# â”€â”€ CORS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# FRONTEND_URL env à¦¥à§‡à¦•à§‡ à¦ªà§‡à¦²à§‡ à¦¯à§‹à¦— à¦•à¦°à§‹ (Vercel URL)
if settings.FRONTEND_URL:
    origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*(\.vercel\.app|\.onrender\.com)",  # à¦¸à¦¬ Vercel preview URL allow
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# â”€â”€ Static Files (uploaded images) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# â”€â”€ Routers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(categories.router)
app.include_router(reviews.router)
app.include_router(wishlist.router)
app.include_router(ai_routes.router)

@app.get("/")
def root():
    return {"message": "ShopAI API is running! ðŸš€", "docs": "/docs", "status": "ok"}

@app.get("/health")
def health():
    return {"status": "ok", "database": "postgresql"}

