from typing import List, Literal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db import SessionLocal
from app.models import Recipe, RecipeIngredient
from app.services import recipe_llm_client

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class recipe_ingredients(BaseModel):
    ingredients: List[str]
    steps: List[str]
    nutrition: List[str]

class UserProfile(BaseModel):
    height_cm: float
    weight_kg: float
    goal: Literal["lose", "maintain", "gain"]

def get_recipe(recipe_id: int, db: Session):
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

# NEW: GET endpoint for basic recipe details (no measurements)
@router.get("/recipes/{recipe_id}")
async def get_recipe_basic(recipe_id: int, db: Session = Depends(get_db)):
    """Get basic recipe details without personalized measurements"""
    return get_recipe(recipe_id, db)

# POST endpoint for recipe with personalized measurements
@router.post("/recipes/{recipe_id}/user_measurements")
async def get_measurements(recipe_id: int, user: UserProfile, db: Session = Depends(get_db)):
    """Get recipe with personalized measurements based on user profile"""
    recipe = get_recipe(recipe_id, db)

    steps = recipe["steps"]
    ingredients = recipe["ingredients"]

    nutrition_list = [
        recipe["calories"],
        recipe["fat_g"],
        recipe["sugar_g"],
        recipe["sodium_mg"],
        recipe["protein_g"],
        recipe["sat_fat_g"],
        recipe["carbs_g"],
    ]

    payload = {
        "recipe": {
            "ingredients": ingredients,
            "steps": steps,
            "nutrition_per_serving": nutrition_list,
        },
        "user": {
            "height_cm": user.height_cm,
            "weight_kg": user.weight_kg,
            "goal": user.goal,
        },
    }

    gen_measurements = await recipe_llm_client.estimate_ingredient_measurements(payload)

    return {
        **recipe,
        "generated_measurements": gen_measurements,
    }