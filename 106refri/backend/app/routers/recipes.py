from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.recipe import Recipe, RecipeLike
from app.models.fridge import FridgeItem
from app.schemas.recipe import RecipeResponse, RecipeWithMatchRate
from app.services.recipe_matcher import compute_match_rate

router = APIRouter()


@router.get("", response_model=List[RecipeResponse])
def list_recipes(db: Session = Depends(get_db)):
    return db.query(Recipe).filter(Recipe.is_public == True).all()


@router.get("/recommendations", response_model=List[RecipeWithMatchRate])
def recommendations(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    fridge_items = db.query(FridgeItem).filter(FridgeItem.user_id == current_user.id).all()
    recipes = db.query(Recipe).filter(Recipe.is_public == True).all()
    result = []
    for recipe in recipes:
        match_rate, missing = compute_match_rate(recipe, fridge_items)
        r = RecipeWithMatchRate.model_validate(recipe)
        r.match_rate = match_rate
        r.missing_ingredients = missing
        result.append(r)
    result.sort(key=lambda x: x.match_rate, reverse=True)
    return result[:10]


@router.get("/{recipe_id}", response_model=RecipeResponse)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@router.post("/{recipe_id}/like")
def like_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    existing = (
        db.query(RecipeLike)
        .filter(
            RecipeLike.user_id == current_user.id, RecipeLike.recipe_id == recipe_id
        )
        .first()
    )
    if not existing:
        db.add(RecipeLike(user_id=current_user.id, recipe_id=recipe_id))
        recipe.likes += 1
        db.commit()
    return {"ok": True}


@router.delete("/{recipe_id}/like")
def unlike_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    like = (
        db.query(RecipeLike)
        .filter(
            RecipeLike.user_id == current_user.id, RecipeLike.recipe_id == recipe_id
        )
        .first()
    )
    if like:
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if recipe and recipe.likes > 0:
            recipe.likes -= 1
        db.delete(like)
        db.commit()
    return {"ok": True}
