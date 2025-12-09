from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.vision_client import detect_ingredients_from_image

router = APIRouter()

@router.post("/recognize")
async def recognize(file: UploadFile = File(...)):
    if file.content_type not in {"image/jpeg", "image/png"}:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    image_bytes = await file.read()
    try:
        ingredients = await detect_ingredients_from_image(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini error: {e}")

    return {"ingredients": ingredients}