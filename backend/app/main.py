from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import dashboard, b2b, auth
from database.seed import init_db
from database.session import engine
from app.models.base import Base
from app.models import user  # pastikan model User ikut terdaftar

app = FastAPI(
    title="AURA (Autonomous Risk & Cashflow Assistant) API",
    description="API untuk platform kecerdasan finansial otonom AURA dengan autentikasi JWT & Google OAuth 2.0",
    version="2.0.0",
)

# Setup CORS untuk frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Di produksi, batasi ke domain frontend Anda
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inisialisasi DB dan buat semua tabel saat startup
@app.on_event("startup")
def startup_event():
    # Buat semua tabel (termasuk tabel users yang baru)
    Base.metadata.create_all(bind=engine)
    init_db()

# Include routers
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(dashboard.router, prefix="/api/v1", tags=["Dashboard"])
app.include_router(b2b.router, prefix="/api/v1", tags=["B2B Partner"])

@app.get("/")
def read_root():
    return {
        "message": "Selamat datang di AURA API",
        "version": "2.0.0",
        "docs": "/docs",
        "auth_endpoints": {
            "register": "POST /api/v1/auth/register",
            "login": "POST /api/v1/auth/login",
            "refresh": "POST /api/v1/auth/refresh",
            "me": "GET /api/v1/auth/me",
            "google_login": "GET /api/v1/auth/google",
            "google_callback": "GET /api/v1/auth/google/callback",
            "google_verify": "POST /api/v1/auth/google/verify",
        }
    }
