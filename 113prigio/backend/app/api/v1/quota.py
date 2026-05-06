from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.core.database import get_db
from app.services.quota_service import get_quota_status
from app.models.user import User

router = APIRouter()

@router.get("/status")
async def get_quota(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    return await get_quota_status(str(current_user.id), db)
