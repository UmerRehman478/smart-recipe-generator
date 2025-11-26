from typing import List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import Recipe, RecipeIngredient

def recommend_recipes(
    db: Session,
    ingredients: List[str],
    max_missing: int = 3,
    limit: int = 20,
) -> List[Dict]:
    """
    max_missing: how many ingredients a recipe is allowed to be missing
    """

    if not ingredients:
        return []
    
    # subquery: count how many of the given ingredients each recipe uses
    matches_subq = (
        db.query(
            RecipeIngredient.recipe_id.label("recipe_id"),
            func.count(RecipeIngredient.id).label("match_count"),
        )
        .filter(RecipeIngredient.ingredient_norm.in_(ingredients))
        .group_by(RecipeIngredient.recipe_id)
        .subquery()
    )

    q = (
        db.query(
            Recipe,
            matches_subq.c.match_count,
        )
        .join(matches_subq, Recipe.id == matches_subq.c.recipe_id)
    )

    results = []
    for recipe, match_count in q:
        if recipe.n_ingredients is None:
            continue

        missing = recipe.n_ingredients - match_count

        if missing > max_missing:
            continue

        #score matches: more matches, fewer missing
        score = float(match_count) - 0.1 * float(missing)

        results.append(
            {
                "id": recipe.id,
                "title": recipe.title,
                "minutes": recipe.minutes,
                "calories": recipe.calories,
                "match_count": int(match_count),
                "missing_count": int(missing),
                "score": score,
            }
        )

    # sort: best first & cut to limit
    results.sort(key=lambda r: r["score"], reverse=True)
    return results[:limit]
