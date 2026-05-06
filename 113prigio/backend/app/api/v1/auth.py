from datetime import datetime, timezone, timedelta
from urllib.parse import urlencode
from fastapi import APIRouter, Depends, Cookie, Response, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
import httpx

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, hash_token
from app.core.dependencies import get_current_user
from app.models.user import User, RefreshToken
from app.models.fridge import Refrigerator

router = APIRouter()
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USER_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


def _cookie_kwargs() -> dict:
    is_prod = settings.APP_ENV == "production"
    return {"httponly": True, "secure": is_prod, "samesite": "none" if is_prod else "lax"}


@router.get("/google/login")
async def google_login():
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
    }
    return {"authorization_url": GOOGLE_AUTH_URL + "?" + urlencode(params)}


@router.get("/google/callback")
async def google_callback(code: str, response: Response, db: AsyncSession = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code, "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        token_data = token_resp.json()
        if "access_token" not in token_data:
            return RedirectResponse(url=f"{settings.FRONTEND_URL}/?error=token_failed")
        userinfo_resp = await client.get(
            GOOGLE_USER_URL,
            headers={"Authorization": f"Bearer {token_data['access_token']}"},
        )
        userinfo = userinfo_resp.json()

    result = await db.execute(select(User).where(User.google_id == userinfo["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            email=userinfo["email"], google_id=userinfo["sub"],
            display_name=userinfo.get("name"), avatar_url=userinfo.get("picture"),
        )
        db.add(user)
        await db.flush()
        db.add(Refrigerator(user_id=user.id))
        await db.commit()
        await db.refresh(user)

    access_token = create_access_token(str(user.id))
    raw_refresh, hashed_refresh = create_refresh_token()
    db.add(RefreshToken(
        user_id=user.id, token_hash=hashed_refresh,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    ))
    await db.commit()

    ck = _cookie_kwargs()
    redirect = RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard", status_code=302)
    redirect.set_cookie("access_token", access_token, max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, **ck)
    redirect.set_cookie("refresh_token", raw_refresh, path="/auth/refresh", max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400, **ck)
    return redirect


@router.post("/refresh")
async def refresh_token(response: Response, refresh_token: str | None = Cookie(default=None), db: AsyncSession = Depends(get_db)):
    if not refresh_token:
        raise HTTPException(401, "No refresh token")
    token_hash = hash_token(refresh_token)
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash, RefreshToken.revoked == False)
    )
    record = result.scalar_one_or_none()
    if not record or record.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(401, "Invalid refresh token")
    access_token = create_access_token(str(record.user_id))
    ck = _cookie_kwargs()
    response.set_cookie("access_token", access_token, max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, **ck)
    return {"status": "ok"}


@router.post("/logout")
async def logout(response: Response, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.execute(update(RefreshToken).where(RefreshToken.user_id == current_user.id).values(revoked=True))
    await db.commit()
    ck = _cookie_kwargs()
    safe = {k: v for k, v in ck.items() if k != "httponly"}
    response.delete_cookie("access_token", **safe)
    response.delete_cookie("refresh_token", **safe)
    return {"status": "ok"}


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id), "email": current_user.email,
        "display_name": current_user.display_name, "avatar_url": current_user.avatar_url,
        "is_admin": current_user.is_admin,
    }
