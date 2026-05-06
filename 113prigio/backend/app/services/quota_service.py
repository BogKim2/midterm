from datetime import datetime
from zoneinfo import ZoneInfo
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.models.usage import MonthlyUsage, FREE_LIMITS, ADMIN_UNLIMITED

KST = ZoneInfo("Asia/Seoul")

def get_kst_year_month() -> str:
    return datetime.now(KST).strftime("%Y-%m")

async def check_and_increment_quota(user_id: str, db: AsyncSession, feature: str = "analysis") -> None:
    year_month = get_kst_year_month()
    async with db.begin_nested():
        result = await db.execute(
            select(MonthlyUsage)
            .where(
                MonthlyUsage.user_id == user_id,
                MonthlyUsage.year_month == year_month,
                MonthlyUsage.feature == feature,
            )
            .with_for_update()
        )
        usage = result.scalar_one_or_none()
        if not usage:
            usage = MonthlyUsage(
                user_id=user_id, year_month=year_month,
                feature=feature, limit_count=FREE_LIMITS.get(feature, 5)
            )
            db.add(usage)
            await db.flush()

        if usage.limit_count < ADMIN_UNLIMITED and usage.usage_count >= usage.limit_count:
            raise HTTPException(402, {"error": "quota_exceeded", "message": "월 사용 횟수를 초과했습니다"})

        usage.usage_count += 1
    await db.commit()

async def get_quota_status(user_id: str, db: AsyncSession) -> dict:
    year_month = get_kst_year_month()
    usages = {}
    for feature in ["analysis", "recipe"]:
        result = await db.execute(
            select(MonthlyUsage).where(
                MonthlyUsage.user_id == user_id,
                MonthlyUsage.year_month == year_month,
                MonthlyUsage.feature == feature,
            )
        )
        u = result.scalar_one_or_none()
        usages[feature] = {
            "usage": u.usage_count if u else 0,
            "limit": u.limit_count if u else FREE_LIMITS.get(feature, 5),
        }

    now = datetime.now(KST)
    reset = datetime(now.year + 1 if now.month == 12 else now.year, 1 if now.month == 12 else now.month + 1, 1, tzinfo=KST)

    return {
        "year_month": year_month,
        "plan_type": "free",
        "reset_date": reset.isoformat(),
        "analysis_usage": usages["analysis"]["usage"],
        "analysis_limit": usages["analysis"]["limit"],
        "analysis_remaining": max(0, usages["analysis"]["limit"] - usages["analysis"]["usage"]),
        "recipe_usage": usages["recipe"]["usage"],
        "recipe_limit": usages["recipe"]["limit"],
        "recipe_remaining": max(0, usages["recipe"]["limit"] - usages["recipe"]["usage"]),
    }
