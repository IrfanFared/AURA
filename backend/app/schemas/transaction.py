from pydantic import BaseModel
from datetime import date
from decimal import Decimal
from typing import Optional

class TransactionBase(BaseModel):
    date: date
    amount: Decimal
    type: str # "income" or "expense"
    description: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int

    class Config:
        from_attributes = True

class DailySummary(BaseModel):
    date: date
    total_income: Decimal
    total_expense: Decimal
    net_cashflow: Decimal
