from fastapi import FastAPI
from app.api import vision, debug, recommend, recipes

app = FastAPI()
app.include_router(vision.router, prefix="/api")
# "ingredients": [
#   {
#     "name": "apple",
#     "confidence": 0.8,
#     "raw_labels": ["apple"]
#   }
# ]
app.include_router(debug.router, prefix="/api")
#db recipes as json list
app.include_router(recommend.router, prefix="/api")
#{
#   "results": [
#     {
#       "id": 88443,
#       "title": "alexis apple crunch",
#       "minutes": 1,
#       "calories": 71.8,
#       "match_count": 1,
#       "missing_count": 1,
#       "score": 0.9
#     },
app.include_router(recipes.router, prefix="/api")
# use results.id to search for recipes