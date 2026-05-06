import json
from app.services.lmstudio_client import get_client, get_chat_model

CANDIDATE_PROMPT = """당신은 한국 요리 전문가입니다.
냉장고 재료: {ingredients}
음식 종류: {food_types}
맛 선호: {tastes}
{diet_instruction}

위 조건으로 만들 수 있는 요리 후보 3가지를 추천하세요.
형식: {{"candidates": [{{"dish": "요리명", "description": "간단설명(20자)", "difficulty": "쉬움|보통|어려움"}}]}}
JSON만 반환, 다른 텍스트 금지."""

RECIPE_PROMPT = """당신은 요리 레시피 전문가입니다.
요리명: {selected_dish}
보유 재료: {ingredients}

{selected_dish} 레시피를 생성하세요.
형식:
{{
  "title": "요리명",
  "ingredients": [{{"name": "재료명", "amount": "양"}}],
  "steps": ["1. ...", "2. ..."],
  "cooking_time": "N분",
  "difficulty": "쉬움|보통|어려움",
  "tips": "조리 팁",
  "missing_ingredients": ["부족한재료"],
  "nutrition": {{"calories": 0, "protein": 0, "carbs": 0, "fat": 0}}
}}
JSON만 반환."""


def _extract_json(raw: str) -> dict:
    raw = raw.strip()
    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0].strip()
    elif "```" in raw:
        raw = raw.split("```")[1].split("```")[0].strip()
    start = raw.find("{")
    if start != -1:
        raw = raw[start:]
    return json.loads(raw)


def recalculate_calories(nutrition: dict) -> dict:
    p = float(nutrition.get("protein") or 0)
    c = float(nutrition.get("carbs") or 0)
    f = float(nutrition.get("fat") or 0)
    nutrition["calories"] = round(p * 4 + c * 4 + f * 9)
    return nutrition


async def generate_candidates(ingredients: list[str], food_types: list[str], tastes: list[str], custom_type: str = "") -> list[dict]:
    model = await get_chat_model()
    client = get_client()
    diet = "저칼로리·고단백 위주 요리를 우선 추천하세요." if "다이어트" in tastes else ""
    all_types = food_types + ([custom_type] if custom_type else [])
    prompt = CANDIDATE_PROMPT.format(
        ingredients=", ".join(ingredients),
        food_types=", ".join(all_types) or "한식",
        tastes=", ".join(tastes) or "무관",
        diet_instruction=diet,
    )
    resp = await client.chat.completions.create(
        model=model,
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    return _extract_json(resp.choices[0].message.content).get("candidates", [])


async def generate_recipe(ingredients: list[str], food_types: list[str], tastes: list[str], selected_dish: str, custom_type: str = "") -> dict:
    model = await get_chat_model()
    client = get_client()
    prompt = RECIPE_PROMPT.format(
        selected_dish=selected_dish,
        ingredients=", ".join(ingredients),
    )
    resp = await client.chat.completions.create(
        model=model,
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
    )
    recipe = _extract_json(resp.choices[0].message.content)
    if "nutrition" in recipe and recipe["nutrition"]:
        recipe["nutrition"] = recalculate_calories(recipe["nutrition"])
    return recipe
