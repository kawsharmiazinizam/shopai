# ============================================================
# backend/app/api/routes/reviews.py — Product Reviews
# ============================================================
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Review, Product
from app.schemas.schemas import ReviewCreate, ReviewOut
from app.services.auth_service import get_current_user
import anthropic
from app.core.config import settings

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

def analyze_sentiment(comment: str) -> str:
    """Use Claude AI to analyze review sentiment"""
    try:
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        msg = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=10,
            messages=[{
                "role": "user",
                "content": f"Classify this review as positive, negative, or neutral. Reply with one word only.\n\nReview: {comment}"
            }]
        )
        return msg.content[0].text.strip().lower()
    except Exception:
        return "neutral"

@router.get("/product/{product_id}", response_model=List[ReviewOut])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.product_id == product_id).all()

@router.post("/", response_model=ReviewOut, status_code=201)
def create_review(data: ReviewCreate, db: Session = Depends(get_db),
                  user=Depends(get_current_user)):
    if not 1 <= data.rating <= 5:
        raise HTTPException(400, "Rating must be 1-5")
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(404, "Product not found")

    # AI sentiment analysis
    sentiment = analyze_sentiment(data.comment) if data.comment else "neutral"

    review = Review(
        user_id=user.id,
        product_id=data.product_id,
        rating=data.rating,
        comment=data.comment,
        sentiment=sentiment
    )
    db.add(review); db.commit(); db.refresh(review)

    # Update product rating
    reviews = db.query(Review).filter(Review.product_id == data.product_id).all()
    product.rating = sum(r.rating for r in reviews) / len(reviews)
    product.review_count = len(reviews)
    db.commit()

    return review
