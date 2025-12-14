<<<<<<< HEAD
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import vision, debug, recommend, recipes

app = FastAPI()
=======
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import vision, debug, recommend, recipes
from app.db import SessionLocal
from app.services.ingredients_cleaner import refresh_canonical_ingredients, get_canonical_ingredients

@asynccontextmanager
async def lifespan(app: FastAPI):
    # STARTUP
    with SessionLocal() as db:
        refresh_canonical_ingredients(db)
        print(f"[Startup] Loaded {len(get_canonical_ingredients())} canonical ingredients")

    yield

    # SHUTDOWN
    print("[Shutdown] Server stopping...")

app = FastAPI(lifespan=lifespan)
>>>>>>> UNew

# CORS Configuration - Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",      # Vite dev server
        "http://127.0.0.1:5173",      # Alternative localhost
        "http://localhost:3000",      # React default port (backup)
    ],
    allow_credentials=True,
    allow_methods=["*"],              # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],              # Allow all headers
)

# API Routes
app.include_router(vision.router, prefix="/api")
# POST /api/recognize - Upload image and detect ingredients
# Returns: {
#   "ingredients": [
#     {
#       "name": "apple",
#       "confidence": 0.8,
#       "raw_labels": ["apple"]
#     }
#   ]
# }

app.include_router(debug.router, prefix="/api")
# GET /api/debug/apple - Test endpoint to get apple recipes

app.include_router(recommend.router, prefix="/api")
# POST /api/recommend - Get recipe recommendations
# Request body: {
#   "ingredients": ["apple", "chicken", "rice"],
#   "max_missing": 3,
#   "limit": 20
# }
# Returns: {
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
#     ...
#   ]
# }

app.include_router(recipes.router, prefix="/api")
# GET /api/recipes/{recipe_id} - Get full recipe details by ID
# Use results.id from /api/recommend to get detailed recipe info