from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.ingredient import CommonIngredient
from pydantic import BaseModel

router = APIRouter()


class CommonIngredientResponse(BaseModel):
    id: int
    name: str
    category: str
    default_unit: str
    is_condiment: bool

    class Config:
        from_attributes = True


@router.get("/common", response_model=List[CommonIngredientResponse])
def list_common(db: Session = Depends(get_db)):
    return db.query(CommonIngredient).all()


@router.get("/search", response_model=List[CommonIngredientResponse])
def search(q: str = Query(""), db: Session = Depends(get_db)):
    return (
        db.query(CommonIngredient)
        .filter(CommonIngredient.name.contains(q))
        .limit(20)
        .all()
    )
