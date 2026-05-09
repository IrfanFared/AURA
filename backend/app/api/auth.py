import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    verify_password, get_password_hash,
    create_access_token, create_refresh_token, decode_token
)
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest, LoginRequest, RefreshTokenRequest,
    TokenResponse, UserResponse
)
from database.session import get_db

router = APIRouter()

# ─── Helper ───────────────────────────────────────────────────────────────────

def _build_user_response(user: User, provider: str = "email") -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        username=user.username,
        avatar_url=user.avatar_url,
        tier=user.tier,
        is_active=user.is_active,
        auth_provider=provider,
    )

def _build_token_response(user: User, provider: str = "email") -> TokenResponse:
    payload = {"sub": str(user.id), "email": user.email}
    return TokenResponse(
        access_token=create_access_token(payload),
        refresh_token=create_refresh_token(payload),
        token_type="bearer",
        user=_build_user_response(user, provider),
    )

# ─── Email / Password Auth ────────────────────────────────────────────────────

@router.post("/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """
    Registrasi akun baru dengan email dan password.
    """
    # Cek apakah email sudah terdaftar
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email sudah terdaftar. Silakan login atau gunakan email lain."
        )

    # Buat username dari email
    base_username = body.email.split("@")[0]
    username = base_username
    counter = 1
    while db.query(User).filter(User.username == username).first():
        username = f"{base_username}{counter}"
        counter += 1

    # Simpan user baru
    new_user = User(
        email=body.email,
        full_name=body.full_name,
        username=username,
        hashed_password=get_password_hash(body.password),
        is_active=True,
        is_verified=False,  # Bisa tambahkan email verification di masa depan
        tier="Free",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return _build_token_response(new_user, provider="email")


@router.post("/auth/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: Session = Depends(get_db)):
    """
    Login dengan email dan password.
    """
    user = db.query(User).filter(User.email == body.email).first()

    # Validasi user dan password
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah."
        )
    if not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Akun ini terdaftar via Google. Gunakan tombol 'Masuk dengan Google'."
        )
    if not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun dinonaktifkan. Hubungi support."
        )

    return _build_token_response(user, provider="email")


@router.post("/auth/refresh", response_model=TokenResponse)
async def refresh_token(body: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Perbarui access token menggunakan refresh token.
    """
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token tidak valid atau sudah kedaluwarsa."
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Pengguna tidak ditemukan."
        )

    provider = "google" if user.google_id else "email"
    return _build_token_response(user, provider=provider)


@router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(request: Request, db: Session = Depends(get_db)):
    """
    Ambil data user yang sedang login berdasarkan Bearer token.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token tidak ditemukan.")

    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token tidak valid.")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pengguna tidak ditemukan.")

    provider = "google" if user.google_id else "email"
    return _build_user_response(user, provider=provider)


# ─── Google OAuth 2.0 ─────────────────────────────────────────────────────────

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


@router.get("/auth/google")
async def google_oauth_redirect():
    """
    Redirect user ke halaman consent Google OAuth.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth belum dikonfigurasi. Set GOOGLE_CLIENT_ID di environment."
        )

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    query_string = "&".join(f"{k}={v}" for k, v in params.items())
    return RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{query_string}")


@router.get("/auth/google/callback")
async def google_oauth_callback(code: str, db: Session = Depends(get_db)):
    """
    Callback dari Google. Tukar authorization code → access token → user info.
    Buat atau temukan user, lalu redirect ke frontend dengan JWT token.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth belum dikonfigurasi."
        )

    async with httpx.AsyncClient() as client:
        # 1. Tukar code dengan token
        token_response = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })

        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Gagal mendapatkan token dari Google."
            )

        google_tokens = token_response.json()
        google_access_token = google_tokens.get("access_token")

        # 2. Ambil info user dari Google
        userinfo_response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {google_access_token}"}
        )

        if userinfo_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Gagal mengambil informasi akun Google."
            )

        google_user = userinfo_response.json()

    google_id = google_user.get("sub")
    email = google_user.get("email")
    full_name = google_user.get("name")
    avatar_url = google_user.get("picture")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tidak dapat mengambil email dari akun Google."
        )

    # 3. Temukan atau buat user
    user = db.query(User).filter(User.google_id == google_id).first()

    if not user:
        # Cek apakah email sudah ada (user punya akun email)
        user = db.query(User).filter(User.email == email).first()

        if user:
            # Hubungkan akun Google dengan akun email yang ada
            user.google_id = google_id
            user.avatar_url = avatar_url or user.avatar_url
            if not user.full_name:
                user.full_name = full_name
        else:
            # Buat akun baru via Google
            base_username = email.split("@")[0]
            username = base_username
            counter = 1
            while db.query(User).filter(User.username == username).first():
                username = f"{base_username}{counter}"
                counter += 1

            user = User(
                email=email,
                full_name=full_name,
                username=username,
                google_id=google_id,
                avatar_url=avatar_url,
                is_active=True,
                is_verified=True,  # Email sudah diverifikasi Google
                tier="Free",
            )
            db.add(user)

        db.commit()
        db.refresh(user)

    # 4. Buat JWT AURA dan redirect ke frontend
    token_resp = _build_token_response(user, provider="google")
    
    # Encode token ke URL dan redirect ke frontend
    frontend_callback_url = (
        f"{settings.FRONTEND_URL}/auth/callback"
        f"?access_token={token_resp.access_token}"
        f"&refresh_token={token_resp.refresh_token}"
        f"&user_id={user.id}"
        f"&email={user.email}"
        f"&name={user.full_name or user.username or ''}"
        f"&avatar={user.avatar_url or ''}"
    )
    return RedirectResponse(url=frontend_callback_url)


@router.post("/auth/google/verify", response_model=TokenResponse)
async def verify_google_token(request: Request, db: Session = Depends(get_db)):
    """
    Verifikasi Google ID Token dari frontend (untuk alur OAuth implicit / popup).
    Body: { "credential": "<google_id_token>" }
    """
    body = await request.json()
    credential = body.get("credential")
    
    if not credential:
        raise HTTPException(status_code=400, detail="Google credential tidak ditemukan.")

    # Verifikasi token dengan Google
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
        )
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Google token tidak valid.")

    google_user = response.json()
    
    # Pastikan audience cocok dengan client ID kita
    if settings.GOOGLE_CLIENT_ID and google_user.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=400, detail="Token tidak ditujukan untuk aplikasi ini.")

    google_id = google_user.get("sub")
    email = google_user.get("email")
    full_name = google_user.get("name")
    avatar_url = google_user.get("picture")

    if not email:
        raise HTTPException(status_code=400, detail="Email tidak ditemukan di token Google.")

    # Cari atau buat user
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.google_id = google_id
            user.avatar_url = avatar_url or user.avatar_url
        else:
            base_username = email.split("@")[0]
            username = base_username
            counter = 1
            while db.query(User).filter(User.username == username).first():
                username = f"{base_username}{counter}"
                counter += 1

            user = User(
                email=email, full_name=full_name, username=username,
                google_id=google_id, avatar_url=avatar_url,
                is_active=True, is_verified=True, tier="Free",
            )
            db.add(user)
        db.commit()
        db.refresh(user)

    return _build_token_response(user, provider="google")
