from fastapi import APIRouter, Depends, HTTPException
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

@router.get("/recipes/{recipe_id}")
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = (
        db.query(Recipe)
        .filter(Recipe.id == recipe_id)
        .first()
    )
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    # get ingredients for this recipe
    ingredients = (
        db.query(RecipeIngredient)
        .filter(RecipeIngredient.recipe_id == recipe_id)
        .all()
    )

    return {
        "id": recipe.id,
        "title": recipe.title,
        "minutes": recipe.minutes,
        "calories": recipe.calories,
        "fat_g": recipe.fat_g,
        "sugar_g": recipe.sugar_g,
        "sodium_mg": recipe.sodium_mg,
        "protein_g": recipe.protein_g,
        "sat_fat_g": recipe.sat_fat_g,
        "carbs_g": recipe.carbs_g,
        "n_steps": recipe.n_steps,
        "steps": recipe.steps.split("\n") if recipe.steps else [],
        "ingredients": [
            {
                "raw": ing.ingredient_raw,
                "norm": ing.ingredient_norm,
            }
            for ing in ingredients
        ],
    }
