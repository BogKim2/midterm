from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.meal_plan import MealPlan
from app.models.fridge import FridgeItem
from app.schemas.meal_plan import (
    MealPlanCreate,
    MealPlanResponse,
    GenerateMealPlanRequest,
)
from app.services.meal_planner import generate_meal_plan

router = APIRouter()


@router.get("", response_model=List[MealPlanResponse])
def list_meal_plans(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return (
        db.query(MealPlan)
        .filter(MealPlan.user_id == current_user.id)
        .order_by(MealPlan.date)
        .all()
    )


@router.post("/generate", response_model=List[MealPlanResponse])
def generate(
    req: GenerateMealPlanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fridge_items = db.query(FridgeItem).filter(FridgeItem.user_id == current_user.id).all()
    plans = generate_meal_plan(
        db, current_user.id, req.days, req.meal_types, req.start_date, fridge_items
    )
    return plans


@router.post("", response_model=MealPlanResponse)
def save_plan(
    plan: MealPlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_plan = MealPlan(**plan.model_dump(), user_id=current_user.id)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan


@router.delete("/{plan_id}")
def delete_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan = (
        db.query(MealPlan)
        .filter(MealPlan.id == plan_id, MealPlan.user_id == current_user.id)
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    db.delete(plan)
    db.commit()
    return {"ok": True}
