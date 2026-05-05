from sqlalchemy import Column, Integer, String, Enum
import enum
from app.models.base import Base

class UserTier(str, enum.Enum):
    FREE = "Free"
    STARTER = "Starter"
    PRO = "Pro"
    BUSINESS = "Business"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    tier = Column(String, default=UserTier.FREE.value) # Use string for simplicity in SQLite
    account_number = Column(String, nullable=True)
