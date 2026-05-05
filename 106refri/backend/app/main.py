from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import engine, Base
from app.routers import auth, fridge, ingredients, recipes, meal_plan, shopping
from app import models

app = FastAPI(title="FridgeChef API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    from app.models import (
        user,
        ingredient,
        fridge as fridge_model,
        recipe,
        meal_plan as meal_plan_model,
        shopping as shopping_model,
    )

    Base.metadata.create_all(bind=engine)
    await seed_data()


async def seed_data():
    from app.database import SessionLocal
    from app.models.ingredient import CommonIngredient
    from app.models.recipe import Recipe, RecipeIngredient
    import json
    import os

    db = SessionLocal()
    try:
        if db.query(CommonIngredient).count() == 0:
            common_ingredients = [
                {
                    "name": "달걀",
                    "category": "단백질",
                    "default_unit": "개",
                    "is_condiment": False,
                },
                {
                    "name": "우유",
                    "category": "유제품",
                    "default_unit": "ml",
                    "is_condiment": False,
                },
                {
                    "name": "양파",
                    "category": "채소",
                    "default_unit": "개",
                    "is_condiment": False,
                },
                {
                    "name": "마늘",
                    "category": "채소",
                    "default_unit": "쪽",
                    "is_condiment": True,
                },
                {
                    "name": "간장",
                    "category": "조미료",
                    "default_unit": "ml",
                    "is_condiment": True,
                },
                {
                    "name": "소금",
                    "category": "조미료",
                    "default_unit": "g",
                    "is_condiment": True,
                },
                {
                    "name": "설탕",
                    "category": "조미료",
                    "default_unit": "g",
                    "is_condiment": True,
                },
                {
                    "name": "참기름",
                    "category": "조미료",
                    "default_unit": "ml",
                    "is_condiment": True,
                },
                {
                    "name": "고추장",
                    "category": "조미료",
                    "default_unit": "g",
                    "is_condiment": True,
                },
                {
                    "name": "된장",
                    "category": "조미료",
                    "default_unit": "g",
                    "is_condiment": True,
                },
                {
                    "name": "닭가슴살",
                    "category": "단백질",
                    "default_unit": "g",
                    "is_condiment": False,
                },
                {
                    "name": "돼지고기",
                    "category": "단백질",
                    "default_unit": "g",
                    "is_condiment": False,
                },
                {
                    "name": "쇠고기",
                    "category": "단백질",
                    "default_unit": "g",
                    "is_condiment": False,
                },
                {
                    "name": "두부",
                    "category": "단백질",
                    "default_unit": "모",
                    "is_condiment": False,
                },
                {
                    "name": "당근",
                    "category": "채소",
                    "default_unit": "개",
                    "is_condiment": False,
                },
                {
                    "name": "감자",
                    "category": "채소",
                    "default_unit": "개",
                    "is_condiment": False,
                },
                {
                    "name": "고구마",
                    "category": "채소",
                    "default_unit": "개",
                    "is_condiment": False,
                },
                {
                    "name": "시금치",
                    "category": "채소",
                    "default_unit": "g",
                    "is_condiment": False,
                },
                {
                    "name": "배추",
                    "category": "채소",
                    "default_unit": "개",
                    "is_condiment": False,
                },
                {
                    "name": "쌀",
                    "category": "곡류",
                    "default_unit": "컵",
                    "is_condiment": False,
                },
                {
                    "name": "라면",
                    "category": "가공식품",
                    "default_unit": "개",
                    "is_condiment": False,
                },
                {
                    "name": "토마토",
                    "category": "채소",
                    "default_unit": "개",
                    "is_condiment": False,
                },
                {
                    "name": "치즈",
                    "category": "유제품",
                    "default_unit": "장",
                    "is_condiment": False,
                },
                {
                    "name": "버터",
                    "category": "유제품",
                    "default_unit": "g",
                    "is_condiment": True,
                },
                {
                    "name": "밀가루",
                    "category": "곡류",
                    "default_unit": "g",
                    "is_condiment": False,
                },
            ]
            for data in common_ingredients:
                db.add(CommonIngredient(**data))
            db.commit()

        if db.query(Recipe).count() == 0:
            seed_path = os.path.join(
                os.path.dirname(__file__), "..", "data", "recipe_seed.json"
            )
            if os.path.exists(seed_path):
                with open(seed_path, encoding="utf-8") as f:
                    recipes_data = json.load(f)
                for r_data in recipes_data:
                    ingredients_data = r_data.pop("ingredients", [])
                    recipe = Recipe(**r_data)
                    db.add(recipe)
                    db.flush()
                    for ing_data in ingredients_data:
                        db.add(RecipeIngredient(recipe_id=recipe.id, **ing_data))
                db.commit()
    finally:
        db.close()


app.include_router(auth.router, prefix="/v1/auth", tags=["auth"])
app.include_router(fridge.router, prefix="/v1/fridge", tags=["fridge"])
app.include_router(ingredients.router, prefix="/v1/ingredients", tags=["ingredients"])
app.include_router(recipes.router, prefix="/v1/recipes", tags=["recipes"])
app.include_router(meal_plan.router, prefix="/v1/meal-plan", tags=["meal-plan"])
app.include_router(shopping.router, prefix="/v1/shopping", tags=["shopping"])


@app.get("/health")
def health():
    return {"status": "ok"}
