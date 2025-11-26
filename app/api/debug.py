# app/api/debug.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models import Recipe, RecipeIngredient

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/debug/apple")
def debug_apple(db: Session = Depends(get_db)):
    q = (
        db.query(Recipe)
        .join(Recipe.ingredients)
        .filter(RecipeIngredient.ingredient_norm == "apple")
        .limit(5)
        .all()
    )
    return [
        {"id": r.id, "title": r.title, "minutes": r.minutes, "calories": r.calories}
        for r in q
    ]
