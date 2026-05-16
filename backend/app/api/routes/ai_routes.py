# ============================================================
# backend/app/api/routes/ai_routes.py — AI Features (Groq)
# ============================================================
from fastapi import APIRouter, HTTPException
from app.schemas.schemas import AIDescRequest, ChatMessage
from app.core.config import settings
import httpx
import json

router = APIRouter(prefix="/api/ai", tags=["AI"])

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

def get_headers():
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "":
        raise HTTPException(503, "AI service not configured. Add GROQ_API_KEY to .env file.")
    return {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

def groq_chat(messages: list, max_tokens: int = 500) -> str:
    headers = get_headers()
    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.7,
    }
    with httpx.Client(timeout=30) as client:
        resp = client.post(GROQ_URL, headers=headers, json=payload)
        if resp.status_code != 200:
            raise HTTPException(502, f"Groq API error: {resp.text}")
        data = resp.json()
        return data["choices"][0]["message"]["content"]


# ── AI Product Description Generator ─────────────────────────
@router.post("/generate-description")
def generate_description(data: AIDescRequest):
    prompt = f"""Write a compelling, SEO-friendly product description for:
Product: {data.product_name}
Category: {data.category}
Brand: {data.brand or 'Not specified'}
Key Features: {data.key_features or 'Not specified'}

Write 2-3 paragraphs. Be enthusiastic but professional."""

    messages = [{"role": "user", "content": prompt}]
    description = groq_chat(messages, max_tokens=500)
    return {"description": description}


# ── AI Chatbot ───────────────────────────────────────────────
@router.post("/chat")
def chat(data: ChatMessage):
    system_msg = {
        "role": "system",
        "content": """You are ShopAI Assistant, a helpful AI for an e-commerce store.
Help customers find products, track orders, answer questions about shipping, returns, and deals.
Be friendly, concise, and helpful. If asked about specific orders, say you'll need them to check their account."""
    }

    # Build message history
    history = []
    for m in data.history:
        if m.get("role") in ("user", "assistant"):
            history.append({"role": m["role"], "content": str(m["content"])})

    messages = [system_msg] + history + [{"role": "user", "content": data.message}]
    reply = groq_chat(messages, max_tokens=400)
    return {"reply": reply}


# ── AI Search Suggestions ────────────────────────────────────
@router.get("/search-suggestions")
def search_suggestions(query: str):
    prompt = f"""For the search query "{query}" on an e-commerce site, suggest 5 related search terms.
Return ONLY a JSON array of strings, nothing else. No explanation.
Example: ["query1", "query2", "query3", "query4", "query5"]"""

    messages = [{"role": "user", "content": prompt}]
    try:
        result = groq_chat(messages, max_tokens=100)
        # Clean markdown fences if any
        clean = result.strip().replace("```json", "").replace("```", "").strip()
        suggestions = json.loads(clean)
        return {"suggestions": suggestions}
    except Exception:
        return {"suggestions": [query]}
