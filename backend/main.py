import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.session import SessionLocal
from database.seed import init_db, seed_data
from app.models.transaction import Transaction
from app.agent.base_agent import AuraAgent
from datetime import date, timedelta
from sqlalchemy import select, desc

def get_last_30_days_income(db):
    # Get the latest transaction date
    latest_txn = db.query(Transaction).order_by(desc(Transaction.date)).first()
    if not latest_txn:
        return []
        
    end_date = latest_txn.date
    start_date = end_date - timedelta(days=30)
    
    incomes = db.query(Transaction).filter(
        Transaction.type == 'income',
        Transaction.date > start_date,
        Transaction.date <= end_date
    ).order_by(Transaction.date).all()
    
    return [float(txn.amount) for txn in incomes]

def main():
    print("Initializing AURA Database...")
    init_db()
    
    print("Seeding transaction data (60 days)...")
    seed_data(days=60)
    
    print("\n--- Running AURA Base Agent ---")
    db = SessionLocal()
    try:
        incomes = get_last_30_days_income(db)
        if not incomes:
            print("No income data found!")
            return
            
        print(f"Collected {len(incomes)} days of income data for volatility analysis.")
        
        agent = AuraAgent(critical_threshold=2500000.0) # 2.5 million IDR critical limit
        prediction, decision = agent.process(incomes)
        
        print("\n[ORACLE FORECAST - ANALYTICS ENGINE]")
        print(f"Mean Daily Income (mu): Rp {prediction.mean_income:,.2f}")
        print(f"Std Deviation (sigma): Rp {prediction.std_dev_income:,.2f}")
        print(f"Critical Threshold (x): Rp {prediction.threshold_used:,.2f}")
        print(f"Probability of Deficit P(X < x): {prediction.probability_deficit:.2%}")
        
        print("\n[AUTONOMOUS SMART VAULT - HEDGE EXECUTOR]")
        print(f"Current Zone: {decision.zone}")
        print(f"Hedging Percentage: {decision.hedging_percentage:.1%}")
        print(f"Action Taken: {decision.action}")
        print("-------------------------------")
        
    finally:
        db.close()

if __name__ == "__main__":
    main()
