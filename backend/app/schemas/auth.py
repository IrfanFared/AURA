from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# --- Request Schemas ---

class RegisterRequest(BaseModel):
    """Schema untuk registrasi dengan email + password."""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimal 8 karakter")
    full_name: str = Field(..., min_length=2, description="Nama lengkap")

class LoginRequest(BaseModel):
    """Schema untuk login dengan email + password."""
    email: EmailStr
    password: str

class RefreshTokenRequest(BaseModel):
    """Schema untuk memperbarui access token."""
    refresh_token: str

# --- Response Schemas ---

class UserResponse(BaseModel):
    """Data user yang dikembalikan ke client (tanpa password)."""
    id: int
    email: str
    full_name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    tier: str = "Free"
    is_active: bool = True
    auth_provider: Optional[str] = None  # "email" atau "google"

    model_config = {"from_attributes": True}

class TokenResponse(BaseModel):
    """Response berisi JWT tokens."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    success: bool = True
