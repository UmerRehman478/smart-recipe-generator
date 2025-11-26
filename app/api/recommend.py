from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.services.recommender import recommend_recipes

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class RecommendRequest(BaseModel):
    ingredients: List[str]
    max_missing: int = 3
    limit: int = 20

@router.post("/recommend")
def recommend(req: RecommendRequest, db: Session = Depends(get_db)):
    recs = recommend_recipes(
        db=db,
        ingredients=req.ingredients,
        max_missing=req.max_missing,
        limit=req.limit,
    )
    return {"results": recs}
