from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.config import settings
from app.core.security import create_access_token
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.user import TokenResponse, UserResponse, UserPreferencesUpdate
import httpx

router = APIRouter()


async def verify_google_token(token: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Google token")
        data = resp.json()
        if (
            data.get("aud") != settings.GOOGLE_CLIENT_ID
            and settings.GOOGLE_CLIENT_ID
        ):
            raise HTTPException(status_code=401, detail="Token audience mismatch")
        return data


@router.post("/google", response_model=TokenResponse)
async def google_login(payload: dict, db: Session = Depends(get_db)):
    token = payload.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Token required")

    google_data = await verify_google_token(token)
    email = google_data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email not found in token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            name=google_data.get("name", ""),
            image_url=google_data.get("picture", ""),
            provider="google",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token({"sub": user.email})
    return TokenResponse(
        access_token=access_token, user=UserResponse.model_validate(user)
    )


@router.post("/demo", response_model=TokenResponse)
async def demo_login(db: Session = Depends(get_db)):
    if not settings.DEMO_LOGIN:
        raise HTTPException(status_code=403, detail="Demo login disabled")

    email = "demo@fridgechef.local"
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, name="Demo User", provider="demo")
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token({"sub": user.email})
    return TokenResponse(
        access_token=access_token, user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me/preferences", response_model=UserResponse)
def update_preferences(
    update: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if update.default_servings is not None:
        current_user.default_servings = update.default_servings
    if update.preferences_json is not None:
        current_user.preferences_json = update.preferences_json
    db.commit()
    db.refresh(current_user)
    return current_user
