from sqlalchemy import Column, Integer, Date, String, TypeDecorator
from cryptography.fernet import Fernet
import os
from app.models.base import Base

# In production, this key must be securely stored in environment variables.
# Generate a key using Fernet.generate_key() if not exists.
_FALLBACK_DEV_KEY = b'AURA_DEV_KEY_DO_NOT_USE_IN_PROD_32b='
# Pad to valid Fernet key length (32 bytes base64url-encoded = 44 chars)
import base64 as _b64
_STABLE_DEV_KEY = _b64.urlsafe_b64encode(b'aura_stable_dev_secret_key_32byt')
SECRET_ENCRYPTION_KEY = os.environ.get("AURA_ENCRYPTION_KEY", _STABLE_DEV_KEY.decode()).encode() if isinstance(os.environ.get("AURA_ENCRYPTION_KEY"), str) else _STABLE_DEV_KEY
cipher_suite = Fernet(SECRET_ENCRYPTION_KEY)

class EncryptedString(TypeDecorator):
    impl = String

    def process_bind_param(self, value, dialect):
        if value is not None:
            return cipher_suite.encrypt(str(value).encode('utf-8')).decode('utf-8')
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return cipher_suite.decrypt(value.encode('utf-8')).decode('utf-8')
        return value

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True, nullable=False)
    # Using EncryptedString to store the amount securely. 
    # In application logic, it must be casted back to float/Decimal
    amount = Column(EncryptedString, nullable=False) 
    type = Column(String, nullable=False)  # 'income' or 'expense'
    description = Column(EncryptedString, nullable=True)
