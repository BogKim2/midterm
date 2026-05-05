from typing import List
from sqlalchemy.orm import Session
from app.models.shopping import ShoppingListItem
from app.models.meal_plan import MealPlan
from app.models.recipe import Recipe


def generate_from_meal_plan(
    db: Session,
    user_id: int,
    meal_plans: List[MealPlan],
    existing_items,
) -> List[ShoppingListItem]:
    db.query(ShoppingListItem).filter(
        ShoppingListItem.user_id == user_id, ShoppingListItem.source == "auto"
    ).delete()

    needed = {}
    for plan in meal_plans:
        if not plan.recipe_id:
            continue
        recipe = db.query(Recipe).filter(Recipe.id == plan.recipe_id).first()
        if not recipe:
            continue
        for ing in recipe.ingredients:
            name = ing.custom_name or (
                ing.common_ingredient.name if ing.common_ingredient else ""
            )
            if name:
                if name not in needed:
                    needed[name] = {
                        "category": "기타",
                        "quantity": 0,
                        "unit": ing.unit,
                        "is_condiment": ing.is_condiment,
                    }
                needed[name]["quantity"] += ing.quantity * plan.servings

    items = []
    for name, data in needed.items():
        item = ShoppingListItem(
            user_id=user_id,
            name=name,
            category=data["category"],
            quantity=data["quantity"],
            unit=data["unit"],
            source="auto",
        )
        db.add(item)
        items.append(item)

    db.commit()
    for item in items:
        db.refresh(item)
    return items
