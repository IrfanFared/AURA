from sqlalchemy import Column, Integer, Numeric, String, Date
from app.models.base import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True, nullable=False)
    amount = Column(Numeric, nullable=False)
    type = Column(String, nullable=False)  # 'income' or 'expense'
    description = Column(String, nullable=True)
