from sqlalchemy import (Column, Integer, BigInteger, Float, Text, ForeignKey)
from sqlalchemy.orm import relationship
from app.db import Base

# SQLAlchemy Models
class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(BigInteger, primary_key=True)
    title = Column(Text)
    minutes = Column(Integer)

    calories = Column(Integer)
    fat_g = Column(Float)
    sugar_g = Column(Float)
    sodium_mg = Column(Float)
    protein_g = Column(Float)
    sat_fat_g = Column(Float)
    carbs_g = Column(Float)

    n_steps = Column(Integer)
    steps = Column(Text)

    n_ingredients = Column(Integer)

    ingredients = relationship("RecipeIngredient", back_populates="recipe", cascade="all, delete-orphan")


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True, autoincrement=True)
    recipe_id = Column(BigInteger, ForeignKey("recipes.id", ondelete="CASCADE"), index=True, nullable=False)

    ingredient_raw = Column(Text, nullable=False)
    ingredient_norm = Column(Text, nullable=False)

    recipe = relationship("Recipe", back_populates="ingredients")