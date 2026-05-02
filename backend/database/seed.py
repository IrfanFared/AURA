import random
from datetime import date, timedelta
from decimal import Decimal
from database.session import SessionLocal, engine
from app.models.base import Base
from app.models.transaction import Transaction

def init_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def seed_data(days=60):
    db = SessionLocal()
    try:
        # Base daily income around 5,000,000 IDR (approx 5 million)
        base_income = 5_000_000
        
        # We need to simulate some volatility for the Analytics engine
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        
        transactions = []
        for i in range(days):
            current_date = start_date + timedelta(days=i)
            
            # Randomize income with some standard deviation to create volatility
            volatility = random.uniform(-0.3, 0.4) # -30% to +40%
            daily_income = base_income * (1 + volatility)
            
            # Sometime significant drop
            if random.random() < 0.1: # 10% chance of bad day
                daily_income = base_income * 0.4 # 60% drop
                
            # Expenses usually correlate with income but have a fixed base
            fixed_expense = 2_000_000
            variable_expense = daily_income * 0.3
            daily_expense = fixed_expense + variable_expense
            
            transactions.append(
                Transaction(
                    date=current_date,
                    amount=Decimal(round(daily_income, 2)),
                    type="income",
                    description="Daily Sales"
                )
            )
            transactions.append(
                Transaction(
                    date=current_date,
                    amount=Decimal(round(daily_expense, 2)),
                    type="expense",
                    description="Daily Operations & Restock"
                )
            )
            
        db.add_all(transactions)
        db.commit()
        print(f"Successfully seeded {days} days of transactions.")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    seed_data()
