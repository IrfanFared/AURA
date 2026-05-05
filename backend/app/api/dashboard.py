from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.orchestrator import AuraOrchestrator
from database.session import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/dashboard/{user_id}")
async def get_dashboard_data(user_id: str, account_no: str = "1234567890", db: Session = Depends(get_db)):
    orchestrator = AuraOrchestrator(db)
    try:
        # Run the autonomous routine to get the latest analysis
        result = await orchestrator.run_daily_sync(user_id, account_no)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
def health_check():
    return {"status": "healthy", "service": "AURA Analytics Engine"}
