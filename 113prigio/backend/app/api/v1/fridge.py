from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.fridge import Refrigerator, Ingredient
from app.schemas.fridge import IngredientCreate, IngredientUpdate
import uuid

router = APIRouter()


async def _get_fridge(user: User, db: AsyncSession) -> Refrigerator:
    result = await db.execute(select(Refrigerator).where(Refrigerator.user_id == user.id))
    fridge = result.scalar_one_or_none()
    if not fridge:
        fridge = Refrigerator(user_id=user.id)
        db.add(fridge)
        await db.commit()
        await db.refresh(fridge)
    return fridge


@router.get("")
async def get_fridge(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    fridge = await _get_fridge(current_user, db)
    result = await db.execute(select(Ingredient).where(Ingredient.refrigerator_id == fridge.id))
    ingredients = result.scalars().all()
    return {
        "id": str(fridge.id),
        "name": fridge.name,
        "ingredients": [
            {
                "id": str(i.id), "name": i.name, "original_name": i.original_name,
                "quantity": float(i.quantity) if i.quantity else None,
                "unit": i.unit, "expiry_date": str(i.expiry_date) if i.expiry_date else None,
                "category": i.category, "source": i.source,
                "created_at": i.created_at.isoformat(),
            }
            for i in ingredients
        ],
    }


@router.post("/ingredients")
async def add_ingredient(
    data: IngredientCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    fridge = await _get_fridge(current_user, db)
    ingredient = Ingredient(refrigerator_id=fridge.id, **data.model_dump())
    db.add(ingredient)
    await db.commit()
    await db.refresh(ingredient)
    return {"id": str(ingredient.id), "name": ingredient.name}


@router.post("/ingredients/bulk")
async def bulk_add_ingredients(
    data: list[IngredientCreate],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    fridge = await _get_fridge(current_user, db)
    added = []
    for item in data:
        ingredient = Ingredient(refrigerator_id=fridge.id, **item.model_dump())
        db.add(ingredient)
        added.append(ingredient.name)
    await db.commit()
    return {"added": added, "count": len(added)}


@router.patch("/ingredients/{ingredient_id}")
async def update_ingredient(
    ingredient_id: str,
    data: IngredientUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    fridge = await _get_fridge(current_user, db)
    result = await db.execute(
        select(Ingredient).where(Ingredient.id == ingredient_id, Ingredient.refrigerator_id == fridge.id)
    )
    ingredient = result.scalar_one_or_none()
    if not ingredient:
        raise HTTPException(404, "Ingredient not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(ingredient, field, value)
    await db.commit()
    return {"id": str(ingredient.id), "name": ingredient.name}


@router.delete("/ingredients/{ingredient_id}")
async def delete_ingredient(
    ingredient_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    fridge = await _get_fridge(current_user, db)
    result = await db.execute(
        select(Ingredient).where(Ingredient.id == ingredient_id, Ingredient.refrigerator_id == fridge.id)
    )
    ingredient = result.scalar_one_or_none()
    if not ingredient:
        raise HTTPException(404, "Ingredient not found")
    await db.delete(ingredient)
    await db.commit()
    return {"status": "deleted"}
