import json
import google.generativeai as genai
from app.core.config import GEMINI_API_KEY  
from app.services.ingredients_cleaner import aggregate

genai.configure(api_key=GEMINI_API_KEY)
MODEL_NAME = "gemini-2.5-flash"
model = genai.GenerativeModel(MODEL_NAME)

def _parse_ingredient_list(text: str) -> list[tuple[str, float]]:
    text = text.strip()
    names_with_conf: list[tuple[str, float]] = []

    if not text:
        return names_with_conf

    # Try JSON first
    if text.startswith("["):
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            data = None

        if isinstance(data, list):
            for item in data:
                # Case 1: {"name": "...", "confidence": 0.9}
                if isinstance(item, dict):
                    name = str(item.get("name", "")).strip().lower()
                    if not name:
                        continue

                    conf_raw = item.get("confidence", 1.0)
                    try:
                        conf = float(conf_raw)
                    except (TypeError, ValueError):
                        conf = 1.0

                    names_with_conf.append((name, conf))

                # Case 2: ["egg", 0.9] or ("egg", 0.9, ...)
                elif isinstance(item, (list, tuple)) and item:
                    name = str(item[0]).strip().lower()
                    if not name:
                        continue

                    conf_raw = item[1] if len(item) > 1 else 1.0
                    try:
                        conf = float(conf_raw)
                    except (TypeError, ValueError):
                        conf = 1.0

                    names_with_conf.append((name, conf))

                # Case 3: "egg"
                else:
                    name = str(item).strip().lower()
                    if name:
                        names_with_conf.append((name, 1.0))

            return names_with_conf

    # Fallback: plain comma-separated string -> default confidence 1.0
    parts = [p.strip().lower() for p in text.split(",") if p.strip()]
    for name in parts:
        names_with_conf.append((name, 1.0))

    return names_with_conf

async def detect_ingredients_from_image(image_bytes: bytes) -> list[str]:
    prompt = """
    Identify visible food ingredients in this image.

    Respond ONLY with a JSON array of objects.
    Each object must have:
    - "name": lowercase, singular ingredient name
    - "confidence": a number between 0.0 and 1.0 indicating how sure you are
                    that the ingredient is visible in the image.

    Example:
    [
    {"name": "egg", "confidence": 0.95},
    {"name": "spinach", "confidence": 0.82}
    ]
    Respond ONLY with a JSON array of lowercase.
    Do NOT include any explanation, markdown, or code fences.
    """

    response = model.generate_content(
        [
            prompt,
            {"mime_type": "image/jpeg", "data": image_bytes},
        ],
        generation_config={"temperature": 0.2},
    )

    text = response.text
    names_with_conf = _parse_ingredient_list(text)
    return aggregate(names_with_conf)
