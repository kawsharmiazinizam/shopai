# ============================================================
# seed_data.py - Sample products, categories & admin user
# PostgreSQL compatible version
# ============================================================
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from app.core.database import engine, SessionLocal, Base
from app.models.models import User, Category, Product
from app.core.security import hash_password

# Create all tables
Base.metadata.create_all(bind=engine)
db = SessionLocal()

# -- Admin User
if not db.query(User).filter(User.email == "admin@shopai.com").first():
    admin = User(
        name="ShopAI Admin",
        email="admin@shopai.com",
        hashed_password=hash_password("admin123"),
        is_admin=True
    )
    db.add(admin)
    print("Admin created: admin@shopai.com / admin123")

# -- Demo User
if not db.query(User).filter(User.email == "user@shopai.com").first():
    user = User(
        name="Demo User",
        email="user@shopai.com",
        hashed_password=hash_password("user123"),
        is_admin=False
    )
    db.add(user)
    print("Demo user created: user@shopai.com / user123")

db.commit()

# -- Categories
cats = ["Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Beauty"]
cat_objs = {}
for c in cats:
    existing = db.query(Category).filter(Category.name == c).first()
    if not existing:
        obj = Category(name=c, description=f"Best {c} products")
        db.add(obj)
        db.flush()
        cat_objs[c] = obj
        print(f"Category: {c}")
    else:
        cat_objs[c] = existing

db.commit()

# -- Products
products_data = [
    {"name": "iPhone 15 Pro", "price": 999.99, "original_price": 1099.99, "stock": 50,
     "brand": "Apple", "category": "Electronics", "rating": 4.8, "review_count": 245,
     "is_featured": True,
     "description": "The latest iPhone with A17 Pro chip, titanium design, and 48MP camera system."},
    {"name": "Samsung Galaxy S24 Ultra", "price": 1199.99, "original_price": 1299.99, "stock": 30,
     "brand": "Samsung", "category": "Electronics", "rating": 4.7, "review_count": 189,
     "is_featured": True,
     "description": "Flagship Android phone with 200MP camera and built-in S Pen."},
    {"name": "Sony WH-1000XM5 Headphones", "price": 349.99, "original_price": 399.99, "stock": 75,
     "brand": "Sony", "category": "Electronics", "rating": 4.9, "review_count": 512,
     "is_featured": True,
     "description": "Industry-leading noise cancellation with 30-hour battery life."},
    {"name": "MacBook Pro 14 inch", "price": 1999.99, "original_price": 2199.99, "stock": 20,
     "brand": "Apple", "category": "Electronics", "rating": 4.9, "review_count": 341,
     "is_featured": False,
     "description": "M3 Pro chip, Liquid Retina XDR display, perfect for professionals."},
    {"name": "Nike Air Max 270", "price": 129.99, "original_price": 159.99, "stock": 100,
     "brand": "Nike", "category": "Fashion", "rating": 4.5, "review_count": 678,
     "is_featured": True,
     "description": "Iconic Air Max cushioning with a large Air unit for all-day comfort."},
    {"name": "Adidas Ultraboost 23", "price": 189.99, "original_price": 220.00, "stock": 60,
     "brand": "Adidas", "category": "Fashion", "rating": 4.6, "review_count": 423,
     "is_featured": False,
     "description": "Responsive Boost midsole returns energy with every step."},
    {"name": "Dyson V15 Detect", "price": 749.99, "original_price": 849.99, "stock": 25,
     "brand": "Dyson", "category": "Home & Garden", "rating": 4.7, "review_count": 298,
     "is_featured": True,
     "description": "Laser detects microscopic dust with precise particle count."},
    {"name": "Instant Pot Duo 7-in-1", "price": 99.99, "original_price": 129.99, "stock": 80,
     "brand": "Instant Pot", "category": "Home & Garden", "rating": 4.8, "review_count": 1240,
     "is_featured": False,
     "description": "7-in-1 electric pressure cooker, slow cooker, rice cooker and more."},
    {"name": "Yoga Mat Pro", "price": 59.99, "original_price": 79.99, "stock": 150,
     "brand": "Manduka", "category": "Sports", "rating": 4.6, "review_count": 387,
     "is_featured": False,
     "description": "Eco-friendly non-slip yoga mat with alignment lines."},
    {"name": "Atomic Habits", "price": 14.99, "original_price": 18.99, "stock": 200,
     "brand": "Penguin", "category": "Books", "rating": 4.9, "review_count": 2341,
     "is_featured": True,
     "description": "Tiny changes, remarkable results. Transform your habits in 4 steps."},
    {"name": "CeraVe Moisturizing Cream", "price": 19.99, "original_price": 24.99, "stock": 300,
     "brand": "CeraVe", "category": "Beauty", "rating": 4.8, "review_count": 1876,
     "is_featured": False,
     "description": "Developed with dermatologists for dry to very dry skin."},
    {"name": "iPad Pro 12.9 inch", "price": 1099.99, "original_price": 1199.99, "stock": 35,
     "brand": "Apple", "category": "Electronics", "rating": 4.8, "review_count": 567,
     "is_featured": True,
     "description": "M2 chip, Liquid Retina XDR display, perfect for creative work."},
]

for p in products_data:
    if not db.query(Product).filter(Product.name == p["name"]).first():
        cat = cat_objs.get(p["category"])
        slug = p["name"].replace(" ", "").replace(".", "")
        prod = Product(
            name=p["name"],
            price=p["price"],
            original_price=p.get("original_price"),
            stock=p["stock"],
            brand=p.get("brand"),
            category_id=cat.id if cat else None,
            rating=p.get("rating", 0),
            review_count=p.get("review_count", 0),
            is_featured=p.get("is_featured", False),
            description=p.get("description", ""),
            image=f"https://picsum.photos/seed/{slug}/400/400"
        )
        db.add(prod)
        print(f"Product: {p['name']}")

db.commit()
db.close()
print("\nDatabase seeded successfully!")
print("Admin Login: admin@shopai.com / admin123")
print("User Login:  user@shopai.com / user123")
