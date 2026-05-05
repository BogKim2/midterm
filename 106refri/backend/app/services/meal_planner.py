from datetime import datetime, timedelta
from typing import List
from sqlalchemy.orm import Session
from app.models.meal_plan import MealPlan
from app.models.recipe import Recipe
from app.models.fridge import FridgeItem
from app.services.recipe_matcher import compute_match_rate
import random


def generate_meal_plan(
    db: Session,
    user_id: int,
    days: int,
    meal_types: List[str],
    start_date: str,
    fridge_items: List[FridgeItem],
) -> List[MealPlan]:
    db.query(MealPlan).filter(MealPlan.user_id == user_id).delete()

    recipes = db.query(Recipe).filter(Recipe.is_public == True).all()
    if not recipes:
        return []

    scored = []
    for recipe in recipes:
        rate, _ = compute_match_rate(recipe, fridge_items)
        scored.append((recipe, rate))
    scored.sort(key=lambda x: x[1], reverse=True)

    plans = []
    start = datetime.strptime(start_date, "%Y-%m-%d")

    for day_offset in range(days):
        date = (start + timedelta(days=day_offset)).strftime("%Y-%m-%d")
        for meal_type in meal_types:
            if scored:
                recipe, _ = random.choice(scored[: max(1, len(scored) // 2)])
                plan = MealPlan(
                    user_id=user_id,
                    date=date,
                    meal_type=meal_type,
                    recipe_id=recipe.id,
                    servings=2,
                )
                db.add(plan)
                plans.append(plan)

    db.commit()
    for plan in plans:
        db.refresh(plan)
    return plans
