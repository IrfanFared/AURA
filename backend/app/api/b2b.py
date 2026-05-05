from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security.api_key import APIKeyHeader
from sqlalchemy.orm import Session
from app.services.orchestrator import AuraOrchestrator
from database.session import SessionLocal

router = APIRouter()

# Simple API Key security for B2B partners
API_KEY_NAME = "X-Partner-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_partner_key(api_key: str = Security(api_key_header)):
    # In production, check against a partners table
    if api_key == "aura_partner_secret_123":
        return api_key
    raise HTTPException(status_code=403, detail="Invalid Partner API Key")

@router.get("/partner/credit-score/{user_id}")
async def get_user_score_for_partner(
    user_id: str, 
    db: Session = Depends(get_db),
    partner_key: str = Depends(get_partner_key)
):
    """
    B2B Endpoint for banks to retrieve AURA Score.
    """
    orchestrator = AuraOrchestrator(db)
    try:
        # Fetch existing analysis (or run fresh)
        # For simplicity, we run a routine
        result = await orchestrator.run_daily_sync(user_id, "1234567890")
        
        return {
            "user_id": user_id,
            "aura_score": result["score"]["total_score"],
            "rating": result["score"]["rating"],
            "dimensions": result["score"]["dimensions"],
            "verified_at": result["score"].get("verified_at", "2026-05-05")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
