import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "aura-super-secret-key-change-in-production-2024")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    # Google OAuth 2.0
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/v1/auth/google/callback")
    
    # GCP Config
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "aura-platform-495406")
    GCP_LOCATION: str = os.getenv("GCP_LOCATION", "asia-southeast1")

    # Frontend URL
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

settings = Settings()
