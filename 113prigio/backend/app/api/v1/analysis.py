from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from typing import List
from app.core.dependencies import get_current_user
from app.core.database import get_db
from app.services.ai_service import analyze_images
from app.services.quota_service import check_and_increment_quota, get_quota_status
from app.models.user import User

router = APIRouter()
MAX_IMAGES = 2
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("/upload")
async def upload_and_analyze(
    images: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    if len(images) > MAX_IMAGES:
        raise HTTPException(400, f"최대 {MAX_IMAGES}장까지 업로드 가능합니다")

    quota = await get_quota_status(str(current_user.id), db)
    if quota["analysis_remaining"] <= 0:
        raise HTTPException(402, {
            "error": "quota_exceeded",
            "message": "월 분석 횟수를 모두 사용했습니다",
            "reset_date": quota["reset_date"],
        })

    image_bytes_list = []
    for img in images:
        if img.content_type not in ALLOWED_TYPES:
            raise HTTPException(400, "JPEG, PNG, WEBP 형식만 허용됩니다")
        data = await img.read()
        if len(data) > MAX_FILE_SIZE:
            raise HTTPException(400, "파일 크기는 10MB 이하여야 합니다")
        image_bytes_list.append(data)

    detected, model_used, has_vision = await analyze_images(image_bytes_list)
    await check_and_increment_quota(str(current_user.id), db, feature="analysis")
    new_quota = await get_quota_status(str(current_user.id), db)

    return {
        "detected_ingredients": detected,
        "model_used": model_used,
        "has_vision": has_vision,
        "analysis": new_quota,
    }
