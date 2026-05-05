from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.fridge import FridgeItem
from app.schemas.fridge import (
    FridgeItemCreate,
    FridgeItemUpdate,
    FridgeItemResponse,
    BulkAddRequest,
)

router = APIRouter()


@router.get("/items", response_model=List[FridgeItemResponse])
def list_items(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return db.query(FridgeItem).filter(FridgeItem.user_id == current_user.id).all()


@router.post("/items", response_model=FridgeItemResponse)
def add_item(
    item: FridgeItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_item = FridgeItem(**item.model_dump(), user_id=current_user.id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.patch("/items/{item_id}", response_model=FridgeItemResponse)
def update_item(
    item_id: int,
    update: FridgeItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = (
        db.query(FridgeItem)
        .filter(FridgeItem.id == item_id, FridgeItem.user_id == current_user.id)
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
        db.query(FridgeItem)
        .filter(FridgeItem.id == item_id, FridgeItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"ok": True}


@router.post("/items/bulk", response_model=List[FridgeItemResponse])
def bulk_add(
    req: BulkAddRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = []
    for item_data in req.items:
        db_item = FridgeItem(**item_data.model_dump(), user_id=current_user.id)
        db.add(db_item)
        items.append(db_item)
    db.commit()
    for item in items:
        db.refresh(item)
    return items
