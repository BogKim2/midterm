from typing import List, Tuple


def compute_match_rate(recipe, fridge_items) -> Tuple[float, List[str]]:
    if not recipe.ingredients:
        return 0.0, []

    fridge_names = {item.name.lower() for item in fridge_items}
    total = len(recipe.ingredients)
    matched = 0
    missing = []

    for ing in recipe.ingredients:
        name = (ing.custom_name or "").lower()
        if ing.common_ingredient and ing.common_ingredient.name:
            name = ing.common_ingredient.name.lower()
        if name and name in fridge_names:
            matched += 1
        elif name:
            missing.append(
                ing.custom_name
                or (ing.common_ingredient.name if ing.common_ingredient else "")
            )

    return round(matched / total * 100, 1) if total > 0 else 0.0, missing
