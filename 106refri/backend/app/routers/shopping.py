from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.shopping import ShoppingListItem
from app.models.meal_plan import MealPlan
from app.schemas.meal_plan import (
    ShoppingItemCreate,
    ShoppingItemUpdate,
    ShoppingItemResponse,
)
from app.services.shopping_list import generate_from_meal_plan

router = APIRouter()


@router.get("", response_model=List[ShoppingItemResponse])
def list_items(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return (
        db.query(ShoppingListItem)
        .filter(ShoppingListItem.user_id == current_user.id)
        .order_by(ShoppingListItem.category)
        .all()
    )


@router.post("/generate", response_model=List[ShoppingItemResponse])
def generate(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    meal_plans = (
        db.query(MealPlan).filter(MealPlan.user_id == current_user.id).all()
    )
    fridge = (
        db.query(ShoppingListItem)
        .filter(ShoppingListItem.user_id == current_user.id)
        .all()
    )
    items = generate_from_meal_plan(db, current_user.id, meal_plans, fridge)
    return items


@router.post("/items", response_model=ShoppingItemResponse)
def add_item(
    item: ShoppingItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_item = ShoppingListItem(**item.model_dump(), user_id=current_user.id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.patch("/items/{item_id}", response_model=ShoppingItemResponse)
def update_item(
    item_id: int,
    update: ShoppingItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = (
        db.query(ShoppingListItem)
        .filter(
            ShoppingListItem.id == item_id, ShoppingListItem.user_id == current_user.id
        )
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    for k, v in update.model_dump(exclude_none=True).items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/items/{item_id}")
def delete_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = (
        db.query(ShoppingListItem)
        .filter(
            ShoppingListItem.id == item_id, ShoppingListItem.user_id == current_user.id
        )
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"ok": True}
