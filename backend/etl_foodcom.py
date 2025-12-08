import os
import ast
import pandas as pd
from sqlalchemy import (
    create_engine
)
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from app.models import Base, Recipe, RecipeIngredient

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in .env")

Base = declarative_base()

#helpers
def parse_nutrition(nutrition_str):
    """
    nutrition looks like:
       "[219.0, 10.0, 4.0, 400.0, 8.0, 3.0, 28.0]"
    """
    try:
        values = ast.literal_eval(nutrition_str)
        if isinstance(values, list) and len(values) >= 7:
            return [float(v) if v is not None else None for v in values[:7]]
    except:
        pass
    return [None] * 7


def parse_steps(steps_str):
    try:
        steps = ast.literal_eval(steps_str)
        if isinstance(steps, list):
            return "\n".join(step.strip() for step in steps)
    except:
        pass
    return None


def parse_ingredients(ingredients_str):
    try:
        arr = ast.literal_eval(ingredients_str)
        if isinstance(arr, list):
            return [str(x).strip() for x in arr]
    except:
        pass
    return []

# ETL main
def run_etl(csv_path="data/RAW_recipes.csv", chunksize=5000):
    engine = create_engine(DATABASE_URL)
    
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    total = 0
    with Session(engine) as session:
        for chunk in pd.read_csv(csv_path, chunksize=chunksize):
            recipes = []
            ingredients = []

            for _, row in chunk.iterrows():
                if pd.isna(row["name"]):
                    continue  # skip recipes without a name

                rid = int(row["id"])

                # parse nutrition
                (
                    calories,
                    fat_g,
                    sugar_g,
                    sodium_mg,
                    protein_g,
                    sat_fat_g,
                    carbs_g,
                ) = parse_nutrition(row["nutrition"])

                recipe = Recipe(
                    id=rid,
                    title=row["name"],
                    minutes=row["minutes"],
                    calories=calories,
                    fat_g=fat_g,
                    sugar_g=sugar_g,
                    sodium_mg=sodium_mg,
                    protein_g=protein_g,
                    sat_fat_g=sat_fat_g,
                    carbs_g=carbs_g,
                    n_steps=row["n_steps"],
                    steps=parse_steps(row["steps"]),
                    n_ingredients=row["n_ingredients"],
                )
                recipes.append(recipe)

                # Ingredients
                ing_list = parse_ingredients(row["ingredients"])
                for ing in ing_list:
                    ingredients.append(
                        RecipeIngredient(
                            recipe_id=rid,
                            ingredient_raw=ing,
                            ingredient_norm=ing.lower(),
                        )
                    )

            session.bulk_save_objects(recipes)
            session.bulk_save_objects(ingredients)
            session.commit()

            total += len(chunk)
            print(f"Loaded {total} recipes...")

    print("ETL Completed!")


if __name__ == "__main__":
    run_etl()
