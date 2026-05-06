from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.dependencies import get_current_user
from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.models.usage import MonthlyUsage, ADMIN_UNLIMITED
from app.services.quota_service import get_kst_year_month
from app.services.lmstudio_client import check_lmstudio_health

router = APIRouter()


def _check_admin(current_user: User):
    if not current_user.is_admin:
        raise HTTPException(403, "Admin only")


@router.get("/lmstudio-health")
async def lmstudio_health(current_user: User = Depends(get_current_user)):
    _check_admin(current_user)
    return await check_lmstudio_health()


@router.post("/set-admin/{user_id}")
async def set_admin(user_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(403, "Admin only")
    await db.execute(update(User).where(User.id == user_id).values(is_admin=True))
    await db.commit()
    return {"status": "ok"}


@router.post("/reset-quota/{user_id}")
async def reset_quota(user_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    _check_admin(current_user)
    year_month = get_kst_year_month()
    await db.execute(
        update(MonthlyUsage)
        .where(MonthlyUsage.user_id == user_id, MonthlyUsage.year_month == year_month)
        .values(usage_count=0, limit_count=ADMIN_UNLIMITED)
    )
    await db.commit()
    return {"status": "ok"}
