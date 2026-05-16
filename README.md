# ⚡ ShopAI — Full Stack AI E-Commerce App

## 🟢 Project Status: FULLY RUNNING

| Service | URL | Status |
|---------|-----|--------|
| Frontend (React) | http://localhost:3000 | ✅ Running |
| Backend (FastAPI) | http://localhost:8000 | ✅ Running |
| API Docs (Swagger) | http://localhost:8000/docs | ✅ Running |

---

## 🚀 Quick Start

### Every time you want to run the project:

1. **Double-click** `START_BACKEND.bat` → opens backend terminal
2. **Double-click** `START_FRONTEND.bat` → opens frontend terminal
3. Open browser → **http://localhost:3000**

---

## 📁 Project Structure

```
ai_ecommerce_project/
├── backend/
│   ├── app/
│   │   ├── api/routes/        # All API endpoints
│   │   │   ├── auth.py        # Login, Register
│   │   │   ├── products.py    # Product CRUD
│   │   │   ├── cart.py        # Cart management
│   │   │   ├── orders.py      # Order placement
│   │   │   ├── reviews.py     # Product reviews
│   │   │   ├── wishlist.py    # Wishlist
│   │   │   ├── categories.py  # Categories
│   │   │   └── ai_routes.py   # AI features
│   │   ├── core/
│   │   │   ├── config.py      # App settings
│   │   │   ├── database.py    # SQLite DB connection
│   │   │   └── security.py    # JWT auth
│   │   ├── models/models.py   # Database tables
│   │   ├── schemas/schemas.py # Pydantic schemas
│   │   └── main.py            # FastAPI app
│   ├── .env                   # Environment variables
│   ├── shopai.db              # SQLite database (with sample data)
│   ├── requirements.txt       # Python packages
│   └── seed_data.py           # Sample data script
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx       # Homepage with products
│       │   ├── Product.jsx    # Product detail + reviews
│       │   ├── Cart.jsx       # Shopping cart
│       │   ├── Checkout.jsx   # Order checkout
│       │   ├── Login.jsx      # Login page
│       │   ├── Register.jsx   # Register page
│       │   ├── Dashboard.jsx  # User dashboard
│       │   └── AdminPanel.jsx # Admin dashboard
│       ├── components/
│       │   ├── Navbar.jsx     # Navigation bar
│       │   ├── ProductCard.jsx # Product card
│       │   ├── CartItem.jsx   # Cart item
│       │   ├── ChatBot.jsx    # AI chatbot popup
│       │   └── Footer.jsx     # Footer
│       ├── context/
│       │   └── CartContext.js # Global cart state
│       └── services/
│           └── api.js         # All API calls
│
├── START_BACKEND.bat          # One-click backend starter
└── START_FRONTEND.bat         # One-click frontend starter
```

---

## 🔑 Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shopai.com | admin123 |
| Test User | test@shopai.com | test1234 |

---

## 🤖 AI Features Setup (Optional)

To enable AI features, add your Anthropic API key to `backend/.env`:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

AI Features include:
- 🤖 AI Chatbot assistant
- ✨ AI product description generator
- 🔍 Smart search suggestions
- 😊 Review sentiment analysis

---

## 🛍️ Features

### Customer Features
- Browse 12+ products with categories
- Search and filter products
- Add to cart / wishlist
- User registration & login
- Order checkout with address
- Order history in dashboard
- Product reviews with star ratings
- AI chatbot for assistance

### Admin Features
- Admin dashboard with analytics
- Product management (add/edit/delete)
- Category management
- Order management with status updates
- Image upload for products

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Tailwind CSS |
| Backend | FastAPI (Python 3.11) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT tokens |
| AI | Claude API (Anthropic) |
| HTTP | Axios |

---

## 🔧 Manual Setup (if batch files don't work)

### Backend:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend:
```bash
cd frontend
npm install
npm start
```
