from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import dashboard, b2b
from database.seed import init_db

app = FastAPI(title="AURA (Autonomous Risk & Cashflow Assistant) API")

# Setup CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on startup
@app.on_event("startup")
def startup_event():
    init_db()

# Include routers
app.include_router(dashboard.router, prefix="/api/v1", tags=["Dashboard"])
app.include_router(b2b.router, prefix="/api/v1", tags=["B2B Partner"])

@app.get("/")
def read_root():
    return {"message": "Welcome to AURA API", "version": "1.0.0"}
