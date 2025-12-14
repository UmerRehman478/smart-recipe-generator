import json
import google.generativeai as genai
from app.core.config import GEMINI_API_KEY 

genai.configure(api_key=GEMINI_API_KEY)
MODEL_NAME = "gemini-2.5-flash"
model = genai.GenerativeModel(MODEL_NAME)

async def estimate_ingredient_measurements(user_recipe_info: dict) -> list[dict]:
    prompt = """
    You are atrition-aware recipe assistant.

    You receive:
    - A recipe with ingredient NAMES, STEPS, and baseline NUTRITION per serving.
    - A user profile with height, weight, and desired health goal 
    (lose weight, maintain, gain weight).
        - height is provided in cm, weight is provided in kg.

    Your task:
    Generate realistic ingredient MEASUREMENTS for a single serving of this recipe
    TAILORED to this user and their desired health goal.

    REQUIREMENTS:
    - Output MUST be a JSON array.
    - Each element: { "ingredient": <string>, "measurement with units": <string> }.
    - Use grams + kitchen units as the unit.
    - Make the recipe suitable for the user's goal:
    - current_health = median calorie intake for their weight and height.
    - "lose_weight": keep calories <= current_health, favor more protein,
        moderate carbs, limit added oils, sugar.
    - "maintain": keep calories ~ current_health (±10%).
    - "gain_weight": allow calories up to ~20% above current_health,
        primarily via carbs and healthy fats.
    - Keep ingredient amounts within realistic cooking ranges:
    - Total added oil (olive oil, butter, etc.) per serving: 0–20 g typical,
        do NOT exceed 30 g.
    - Use realistic cooking quantities.
    - Salt per serving: 0–5 g, do NOT exceed 6 g.
    - Sugar per serving (if present): 0–20 g, do NOT exceed 30 g.
    - Spices and dried herbs: usually 0–5 g each.
    - Garlic: ~3–10 g per clove.
    - One medium onion ~110 g; adjust as needed.
    - Try to stay roughly consistent with the original nutrition profile, but the
    user's target calories and goal are more important.
    - Do NOT invent new ingredients (use ONLY the given ingredient list).

    OUTPUT FORMAT (STRICT):
    [
    { "ingredient": "chicken breast", "grams": 150 },
    { "ingredient": "broccoli", "grams": 80 },
    ...
    ]

    Do NOT include explanations, comments, or code fences. Only return the JSON array.
    """

    recipe = user_recipe_info["recipe"]
    user = user_recipe_info["user"]

    parts = [
        f'INGREDIENTS:\n{recipe["ingredients"]}',
        f'STEPS:\n{recipe["steps"]}',
        f'NUTRITION PER SERVING:\n{recipe["nutrition_per_serving"]}',
        f'HEIGHT IN CM: \n{user["height_cm"]}',
        f'WEIGHT IN KG: \n{user["weight_kg"]}',
        f'GOAL: \n{user["goal"]}'
    ]

    content = "\n\n".join(parts)

    response = model.generate_content(
        [prompt, content],
        generation_config={"temperature": 0.0},
    )

    text = (response.text or "").strip()
    return json.loads(text)