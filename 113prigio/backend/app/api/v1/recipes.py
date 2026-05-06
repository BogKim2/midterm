from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.core.database import get_db
from app.services.recipe_service import generate_candidates, generate_recipe
from app.services.quota_service import check_and_increment_quota, get_quota_status
from app.schemas.recipe import RecipeCandidateRequest, RecipeGenerateRequest
from app.models.user import User

router = APIRouter()

CURATED_RECIPES = [
    {"id": "1", "title": "김치찌개", "difficulty": "쉬움", "cooking_time": "20분", "description": "한국의 대표 찌개"},
    {"id": "2", "title": "된장찌개", "difficulty": "쉬움", "cooking_time": "15분", "description": "구수한 된장찌개"},
    {"id": "3", "title": "계란볶음밥", "difficulty": "쉬움", "cooking_time": "10분", "description": "간단하고 맛있는 볶음밥"},
]


@router.post("/ai/candidates")
async def get_candidates(
    req: RecipeCandidateRequest,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    quota = await get_quota_status(str(current_user.id), db)
    if quota["recipe_remaining"] <= 0:
        raise HTTPException(402, {"error": "quota_exceeded", "message": "월 레시피 횟수를 모두 사용했습니다"})

    try:
        candidates = await generate_candidates(req.ingredients, req.food_types, req.tastes, req.custom_type)
    except Exception as e:
        raise HTTPException(500, f"AI 오류: {str(e)}")

    await check_and_increment_quota(str(current_user.id), db, feature="recipe")
    return {"candidates": candidates}


@router.post("/ai/generate")
async def get_recipe(
    req: RecipeGenerateRequest,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    try:
        recipe = await generate_recipe(req.ingredients, req.food_types, req.tastes, req.selected_dish, req.custom_type)
    except Exception as e:
        raise HTTPException(500, f"AI 오류: {str(e)}")
    return recipe


@router.get("/curated")
async def get_curated(current_user: User = Depends(get_current_user)):
    return {"recipes": CURATED_RECIPES}
