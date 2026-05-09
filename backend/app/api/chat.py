from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import date, timedelta

from database.session import get_db
from app.models.transaction import Transaction
from app.services.chatbot import ChatbotService

router = APIRouter()
chatbot = ChatbotService()

class ChatRequest(BaseModel):
    user_id: str
    message: str

@router.post("/chat/message")
async def send_message(body: ChatRequest, db: Session = Depends(get_db)):
    # 1. Build context
    end_date = date.today()
    start_date = end_date - timedelta(days=30)
    txns = db.query(Transaction).filter(Transaction.date >= start_date).all()
    
    total_income = sum(float(t.amount) for t in txns if t.type == 'income')
    total_expense = sum(float(t.amount) for t in txns if t.type == 'expense')
    net_cashflow = total_income - total_expense
    
    # Access singleton vault balance from dashboard to simulate real state
    try:
        from app.api.dashboard import _vault_executor
        vault_balance = _vault_executor.active_vaults.get(body.user_id, 0.0)
    except ImportError:
        vault_balance = 0.0
    
    # Calculate simple score for context
    score = "Sedang"
    if net_cashflow > 0 and len(txns) > 5:
        score = "Sangat Baik"
    elif net_cashflow < 0:
        score = "Perlu Perhatian"
        
    context = {
        "score": score,
        "vault_balance": vault_balance,
        "total_income": total_income,
        "total_expense": total_expense,
        "net_cashflow": net_cashflow,
    }
    
    # 2. Get response from Gemini
    answer = chatbot.generate_response(body.message, context)
    
    return {
        "status": "success",
        "reply": answer
    }
