# app/services/ingredients_cleaner.py
import inflect
from rapidfuzz import process

p = inflect.engine()

#Synonyms: add back later for words of same meaning

CANONICAL_INGREDIENTS = [
    "apple",
    "bell pepper",
    "green onion",
    "spinach",
    "chicken breast",
    # load more from data
]

def normalize_label(label: str) -> str:
    text = label.strip().lower()
    for ch in ",.!?;:":
        text = text.replace(ch, " ")
    text = " ".join(text.split())

    parts = text.split()
    if parts:
        parts[-1] = p.singular_noun(parts[-1]) or parts[-1]
    return " ".join(parts)

def map_to_canonical(name: str, score_cutoff: float = 80.0) -> str | None:
    name = normalize_label(name)
    match, score, _ = process.extractOne(
        name,
        CANONICAL_INGREDIENTS,
        score_cutoff=score_cutoff
    ) or (None, None, None)
    return match  

def aggregate(names_with_conf: list[tuple[str, float]]) -> list[dict]:
    buckets: dict[str, dict] = {}

    for raw_name, conf in names_with_conf:
        canon = map_to_canonical(raw_name)
        if not canon:
            continue

        if canon not in buckets:
            buckets[canon] = { #updated gemini output structure
                "name": canon,
                "max_conf": conf,
                "raw_labels": [raw_name],
            }
        else:
            b = buckets[canon]
            b["max_conf"] = max(b["max_conf"], conf)
            b["raw_labels"].append(raw_name)

    results = []
    for item in buckets.values():
        if item["max_conf"] < 0.3: #ignore low confidence ingredients
            continue
        results.append({
            "name": item["name"],
            "confidence": float(item["max_conf"]),
            "raw_labels": item["raw_labels"],
        })

    results.sort(key=lambda x: x["confidence"], reverse=True)
    return results
