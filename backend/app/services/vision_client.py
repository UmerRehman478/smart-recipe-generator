import json
import google.generativeai as genai
from app.core.config import GEMINI_API_KEY  
from app.services.ingredients_cleaner import aggregate

genai.configure(api_key=GEMINI_API_KEY)
MODEL_NAME = "gemini-2.5-flash"
model = genai.GenerativeModel(MODEL_NAME)

def _parse_ingredient_list(text: str) -> list[str]:
    text = text.strip()

    if text.startswith("["):
        try:
            data = json.loads(text)
            return [str(x).strip().lower() for x in data]
        except json.JSONDecodeError:
            pass

    parts = [p.strip().lower() for p in text.split(",") if p.strip()]
    return parts

async def detect_ingredients_from_image(image_bytes: bytes) -> list[str]:
    prompt = """
    Identify visible food ingredients in this image.
    Respond ONLY with a JSON array of lowercase, singular ingredient names.
    Example: ["egg", "spinach", "tomato"]
    """

    response = model.generate_content(
        [
            prompt,
            {"mime_type": "image/jpeg", "data": image_bytes},
        ],
        generation_config={"temperature": 0.0},
    )

    names = _parse_ingredient_list(response.text)
    names_with_conf = [(name, 0.8) for name in names]

    return  aggregate(names_with_conf)
