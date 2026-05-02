import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.base import Base
from app.models.transaction import Transaction
from datetime import date
from decimal import Decimal

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

def test_create_transaction(db_session):
    txn = Transaction(
        date=date(2026, 5, 1),
        amount=Decimal("100.50"),
        type="income",
        description="Test Income"
    )
    db_session.add(txn)
    db_session.commit()
    
    db_txn = db_session.query(Transaction).first()
    assert db_txn.amount == Decimal("100.50")
    assert db_txn.type == "income"

def test_transaction_query_filter(db_session):
    txns = [
        Transaction(date=date(2026, 5, 1), amount=Decimal("100"), type="income"),
        Transaction(date=date(2026, 5, 2), amount=Decimal("200"), type="income"),
        Transaction(date=date(2026, 5, 3), amount=Decimal("50"), type="expense"),
    ]
    db_session.add_all(txns)
    db_session.commit()
    
    incomes = db_session.query(Transaction).filter(Transaction.type == "income").all()
    assert len(incomes) == 2
    assert sum(t.amount for t in incomes) == Decimal("300")
