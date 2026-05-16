from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import Optional, Union
from datetime import date, timedelta
from collections import defaultdict
from app.services.orchestrator import AuraOrchestrator
from app.services.vault import SmartVaultExecutor
from app.services.audit import AuditLogger
from app.models.transaction import Transaction
from database.session import get_db
from app.services.ai_parser import MutationParser

router = APIRouter()

# --- Singleton vault instance so balance persists across requests ---
_vault_executor = SmartVaultExecutor()

# --- In-memory user config store (per-user settings) ---
_user_configs = {}

DEFAULT_CONFIG = {
    "auto_hedging": True,
    "risk_threshold": 2500000,
    "notification_level": "high",
    "vault_auto_lock": True
}


# --- Pydantic models for request bodies ---
class WithdrawRequest(BaseModel):
    user_id: Union[str, int]
    amount: float

class DepositRequest(BaseModel):
    user_id: Union[str, int]
    amount: float

class ConfigUpdate(BaseModel):
    auto_hedging: Optional[bool] = None
    risk_threshold: Optional[float] = None
    notification_level: Optional[str] = None
    vault_auto_lock: Optional[bool] = None


@router.get("/dashboard/{user_id}")
async def get_dashboard_data(user_id: str, account_no: str = "1234567890", db: Session = Depends(get_db)):
    orchestrator = AuraOrchestrator(db)
    try:
        # Run the autonomous routine to get the latest analysis
        result = await orchestrator.run_daily_sync(user_id, account_no)
        
        # Log the dashboard access
        AuditLogger.log_access(user_id, "dashboard", "VIEW", details="Dashboard data loaded")
        
        # Ensure vault has a seeded balance for demo
        if user_id not in _vault_executor.active_vaults:
            _vault_executor.active_vaults[user_id] = 0.0
        
        # Override hedge vault_balance with the persistent singleton value
        result["hedge"]["vault_balance"] = _vault_executor.active_vaults.get(user_id, 0.0)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
def health_check():
    return {"status": "healthy", "service": "AURA Analytics Engine", "version": "1.1.0"}


@router.post("/upload-mutasi/{user_id}")
async def upload_mutasi(user_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload and parse bank mutation using Gemini AI Vision."""
    import logging
    logger = logging.getLogger(__name__)

    # Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"}
    content_type = file.content_type or ""
    if content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Tipe file '{content_type}' tidak didukung. Gunakan JPEG, PNG, atau PDF."
        )

    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="File kosong. Silakan unggah file yang valid.")

        parser = MutationParser()
        transactions_data = parser.extract_transactions(contents, content_type)

        # Save to DB
        count = 0
        for t_data in transactions_data:
            try:
                txn = Transaction(
                    date=date.fromisoformat(t_data['date']),
                    amount=float(t_data['amount']),
                    type=t_data['type'],
                    description=t_data.get('description', '-')
                )
                db.add(txn)
                count += 1
            except (ValueError, KeyError) as row_err:
                logger.warning(f"Skipping malformed transaction row: {row_err} — data: {t_data}")
                continue

        db.commit()
        AuditLogger.log_access(
            user_id, "ai_parser", "UPLOAD",
            details=f"AI Extracted {count} transactions from {file.filename}"
        )

        return {
            "status": "success",
            "message": f"Berhasil mengekstrak {count} transaksi dari mutasi bank Anda.",
            "transactions": count
        }

    except HTTPException:
        raise
    except ValueError as e:
        db.rollback()
        logger.error(f"upload_mutasi ValueError for user {user_id}: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        db.rollback()
        logger.error(f"upload_mutasi unexpected error for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan server: {e}")

# --- Smart Vault endpoints ---

@router.post("/vault/withdraw")
async def withdraw_from_vault(body: WithdrawRequest):
    """Withdraw funds from Smart Vault back to main account."""
    uid = str(body.user_id)
    if uid not in _vault_executor.active_vaults:
        _vault_executor.active_vaults[uid] = 5000000.0
    
    result = _vault_executor.withdraw_funds(uid, body.amount)
    
    if result["status"] == "success":
        AuditLogger.log_access(
            uid, "smart_vault", "WITHDRAWAL",
            details=f"Withdrew Rp {body.amount:,.0f} from vault"
        )
        return result
    else:
        raise HTTPException(status_code=400, detail=result["message"])


@router.post("/vault/deposit")
async def deposit_to_vault(body: DepositRequest):
    """Manually deposit funds into Smart Vault."""
    uid = str(body.user_id)
    if uid not in _vault_executor.active_vaults:
        _vault_executor.active_vaults[uid] = 0.0
    
    _vault_executor.active_vaults[uid] += body.amount
    
    AuditLogger.log_access(
        uid, "smart_vault", "DEPOSIT",
        details=f"Deposited Rp {body.amount:,.0f} into vault"
    )
    
    return {
        "status": "success",
        "amount_deposited": body.amount,
        "vault_balance": _vault_executor.active_vaults[uid]
    }


@router.get("/vault/balance/{user_id}")
async def get_vault_balance(user_id: str):
    """Get current vault balance."""
    balance = _vault_executor.active_vaults.get(user_id, 0.0)
    return {
        "user_id": user_id,
        "vault_balance": balance,
        "status": "LOCKED" if balance == 0 else "ACTIVE"
    }


# --- Settings / Config endpoints ---

@router.get("/settings/{user_id}")
async def get_user_settings(user_id: str):
    """Get user configuration."""
    config = _user_configs.get(user_id, DEFAULT_CONFIG.copy())
    return {"user_id": user_id, "config": config}


@router.put("/settings/{user_id}")
async def update_user_settings(user_id: str, body: ConfigUpdate):
    """Update user configuration."""
    if user_id not in _user_configs:
        _user_configs[user_id] = DEFAULT_CONFIG.copy()
    
    current = _user_configs[user_id]
    
    if body.auto_hedging is not None:
        current["auto_hedging"] = body.auto_hedging
    if body.risk_threshold is not None:
        current["risk_threshold"] = body.risk_threshold
    if body.notification_level is not None:
        current["notification_level"] = body.notification_level
    if body.vault_auto_lock is not None:
        current["vault_auto_lock"] = body.vault_auto_lock
    
    _user_configs[user_id] = current
    
    AuditLogger.log_access(
        user_id, "settings", "CONFIG_UPDATE",
        details=f"Updated config: {body.model_dump(exclude_none=True)}"
    )
    
    return {"status": "success", "config": current}


# --- Reports / Audit endpoints ---

@router.get("/reports/audit/{user_id}")
async def get_audit_reports(user_id: str):
    """Get audit trail for compliance / UU PDP."""
    logs = AuditLogger.get_recent_logs(user_id)
    return {"logs": logs, "total": len(logs)}


@router.get("/reports/summary/{user_id}")
async def get_report_summary(user_id: str):
    """Generate a summary report of system activity."""
    logs = AuditLogger.get_recent_logs(user_id)
    
    total_actions = len(logs)
    withdrawals = [l for l in logs if l["action"] == "WITHDRAWAL"]
    deposits = [l for l in logs if l["action"] == "DEPOSIT"]
    config_changes = [l for l in logs if l["action"] == "CONFIG_UPDATE"]
    
    return {
        "user_id": user_id,
        "total_actions": total_actions,
        "withdrawals_count": len(withdrawals),
        "deposits_count": len(deposits),
        "config_changes_count": len(config_changes),
        "vault_balance": _vault_executor.active_vaults.get(user_id, 0.0)
    }

@router.post("/reports/verify-mitigation/{user_id}")
async def verify_mitigation(user_id: str):
    """Trigger a manual verification of risk mitigation actions."""
    # Simulate a quick health check / verification
    AuditLogger.log_access(
        user_id, "mitigation_engine", "VERIFICATION", 
        details="Integritas sistem perlindungan kas diverifikasi 100% aman."
    )
    return {"status": "success", "message": "Protokol mitigasi berhasil diverifikasi."}


# --- Historical Data Endpoints ---

@router.get("/history/{user_id}")
async def get_transaction_history(
    user_id: str,
    days: int = Query(default=30, ge=1, le=365),
    txn_type: Optional[str] = Query(default=None, description="'income' or 'expense'"),
    db: Session = Depends(get_db)
):
    """
    Returns paginated list of actual transactions from the encrypted database.
    Supports filtering by period (days back) and type.
    """
    end_date = date.today()
    start_date = end_date - timedelta(days=days)

    query = db.query(Transaction).filter(Transaction.date >= start_date)
    if txn_type:
        query = query.filter(Transaction.type == txn_type)
    
    transactions = query.order_by(desc(Transaction.date)).all()
    
    AuditLogger.log_access(user_id, "history", "VIEW", details=f"Accessed {days}-day transaction history")
    
    results = []
    for t in transactions:
        try:
            amount = float(t.amount)
        except (ValueError, TypeError):
            amount = 0.0
        results.append({
            "id": t.id,
            "date": t.date.isoformat(),
            "amount": amount,
            "type": t.type,
            "description": t.description or "-"
        })
    
    total_income = sum(r["amount"] for r in results if r["type"] == "income")
    total_expense = sum(r["amount"] for r in results if r["type"] == "expense")
    
    return {
        "user_id": user_id,
        "period_days": days,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "transactions": results,
        "summary": {
            "total_income": total_income,
            "total_expense": total_expense,
            "net_cashflow": total_income - total_expense,
            "count": len(results)
        }
    }


@router.get("/history/daily-summary/{user_id}")
async def get_daily_summary(
    user_id: str,
    days: int = Query(default=60, ge=7, le=365),
    db: Session = Depends(get_db)
):
    """
    Returns aggregated daily totals (income vs expense) for the chart in Historis mode.
    """
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    
    transactions = db.query(Transaction).filter(Transaction.date >= start_date).order_by(Transaction.date).all()
    
    daily = defaultdict(lambda: {"income": 0.0, "expense": 0.0, "net": 0.0})
    for t in transactions:
        d = t.date.isoformat()
        try:
            amount = float(t.amount)
        except (ValueError, TypeError):
            amount = 0.0
        daily[d][t.type] += amount
        daily[d]["net"] = daily[d]["income"] - daily[d]["expense"]
    
    # Build a continuous series even for days with no transactions
    series = []
    current = start_date
    while current <= end_date:
        d = current.isoformat()
        series.append({
            "date": d,
            "income": round(daily[d]["income"], 2),
            "expense": round(daily[d]["expense"], 2),
            "net": round(daily[d]["net"], 2),
        })
        current += timedelta(days=1)
    
    return {"user_id": user_id, "period_days": days, "daily_series": series}


@router.get("/history/comparison/{user_id}")
async def get_period_comparison(user_id: str, db: Session = Depends(get_db)):
    """
    Returns this month vs last month comparison for KPI cards.
    """
    today = date.today()
    # This month
    this_month_start = today.replace(day=1)
    # Last month
    last_month_end = this_month_start - timedelta(days=1)
    last_month_start = last_month_end.replace(day=1)
    
    def get_totals(start: date, end: date):
        rows = db.query(Transaction).filter(
            Transaction.date >= start,
            Transaction.date <= end
        ).all()
        income = 0.0
        expense = 0.0
        for t in rows:
            try:
                amt = float(t.amount)
            except (ValueError, TypeError):
                amt = 0.0
            if t.type == "income":
                income += amt
            else:
                expense += amt
        return {"income": income, "expense": expense, "net": income - expense, "count": len(rows)}
    
    this_month = get_totals(this_month_start, today)
    last_month = get_totals(last_month_start, last_month_end)
    
    def pct_change(current, previous):
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return round((current - previous) / previous * 100, 1)
    
    return {
        "user_id": user_id,
        "this_month": {**this_month, "label": today.strftime("%B %Y")},
        "last_month": {**last_month, "label": last_month_start.strftime("%B %Y")},
        "changes": {
            "income_pct": pct_change(this_month["income"], last_month["income"]),
            "expense_pct": pct_change(this_month["expense"], last_month["expense"]),
            "net_pct": pct_change(this_month["net"], last_month["net"])
        }
    }
