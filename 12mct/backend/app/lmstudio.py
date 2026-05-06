import base64
import json
import os
from typing import Any

import httpx


class LMStudioClient:
    def __init__(self) -> None:
        self.enabled = os.environ.get("LMSTUDIO_ENABLED", "true").lower() == "true"
        self.base_url = os.environ.get("LMSTUDIO_BASE_URL", "http://127.0.0.1:1234").rstrip("/")
        self.model = os.environ.get("LMSTUDIO_MODEL", "qwen/qwen3-vl-8b")
        self.timeout = float(os.environ.get("LMSTUDIO_TIMEOUT_SECONDS", "180"))

    def health(self) -> dict[str, Any]:
        if not self.enabled:
            return {"enabled": False, "reachable": False, "model": self.model}

        try:
            response = httpx.get(f"{self.base_url}/v1/models", timeout=self.timeout)
            response.raise_for_status()
            data = response.json()
            model_ids = [item["id"] for item in data.get("data", [])]
            return {
                "enabled": True,
                "reachable": True,
                "model": self.model,
                "model_available": self.model in model_ids,
            }
        except Exception:
            return {"enabled": True, "reachable": False, "model": self.model}

    def analyze_food(
        self,
        *,
        nutrition: dict[str, Any],
        image_bytes: bytes | None = None,
        remaining_calories: int | None = None,
        timeout_seconds: float | None = None,
    ) -> dict[str, Any]:
        if not self.enabled:
            return self._fallback_food_insight(nutrition)

        prompt = (
            "You are a meal tracking coach. "
            "Return JSON only. "
            'Format: {"title": string, "summary": string, "tips": [string, string]}. '
            "The title, summary, and tips must be written in Korean. "
            "Keep the summary within 2 sentences and tips within 2 items."
        )
        user_text = (
            f"음식명: {nutrition.get('name_ko')}\n"
            f"카테고리: {nutrition.get('category')}\n"
            f"칼로리: {nutrition.get('calorie')} kcal\n"
            f"탄수화물: {nutrition.get('carbs_g')} g\n"
            f"단백질: {nutrition.get('protein_g')} g\n"
            f"지방: {nutrition.get('fat_g')} g\n"
        )
        if remaining_calories is not None:
            user_text += f"오늘 남은 권장 칼로리: {remaining_calories} kcal\n"

        content: list[dict[str, Any]] = [{"type": "text", "text": user_text}]
        if image_bytes:
            data_url = "data:image/jpeg;base64," + base64.b64encode(image_bytes).decode("utf-8")
            content.append({"type": "image_url", "image_url": {"url": data_url}})

        payload = {
            "model": self.model,
            "temperature": 0.2,
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": content},
            ],
        }

        try:
            response = httpx.post(
              f"{self.base_url}/v1/chat/completions",
              json=payload,
              timeout=timeout_seconds or self.timeout,
            )
            response.raise_for_status()
            content_text = response.json()["choices"][0]["message"]["content"]
            parsed = self._parse_json_block(content_text)
            return {
                "source": "lmstudio",
                "title": parsed.get("title", "한 끼 분석"),
                "summary": parsed.get("summary", ""),
                "tips": parsed.get("tips", []),
            }
        except Exception:
            return self._fallback_food_insight(nutrition)

    def summarize_meal(
        self,
        *,
        foods: list[dict[str, Any]],
        target_calories: int | None = None,
        remaining_calories: int | None = None,
        timeout_seconds: float | None = None,
    ) -> dict[str, Any]:
        if not self.enabled:
            return self._fallback_meal_insight(foods, target_calories, remaining_calories)

        foods_text = "\n".join(
            [
                f"- {food.get('name_ko')}: {food.get('calorie')} kcal, "
                f"탄수 {food.get('carbs_g')}g, 단백질 {food.get('protein_g')}g, 지방 {food.get('fat_g')}g"
                for food in foods
            ]
        )
        prompt = (
            "You are a meal tracking coach. "
            "Return JSON only. "
            'Format: {"title": string, "summary": string, "tips": [string, string]}. '
            "The title, summary, and tips must be written in Korean. "
            "Keep the summary within 2 sentences and tips within 2 items."
        )
        user_text = f"음식 목록:\n{foods_text}\n"
        if target_calories is not None:
            user_text += f"하루 목표 칼로리: {target_calories} kcal\n"
        if remaining_calories is not None:
            user_text += f"식사 후 남은 권장 칼로리: {remaining_calories} kcal\n"

        payload = {
            "model": self.model,
            "temperature": 0.2,
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_text},
            ],
        }

        try:
            response = httpx.post(
                f"{self.base_url}/v1/chat/completions",
                json=payload,
                timeout=timeout_seconds or self.timeout,
            )
            response.raise_for_status()
            content_text = response.json()["choices"][0]["message"]["content"]
            parsed = self._parse_json_block(content_text)
            return {
                "source": "lmstudio",
                "title": parsed.get("title", "식사 분석"),
                "summary": parsed.get("summary", ""),
                "tips": parsed.get("tips", []),
            }
        except Exception:
            return self._fallback_meal_insight(foods, target_calories, remaining_calories)

    def _parse_json_block(self, content: str) -> dict[str, Any]:
        start = content.find("{")
        end = content.rfind("}")
        if start == -1 or end == -1:
            raise ValueError("JSON block not found")
        return json.loads(content[start : end + 1])

    def _fallback_food_insight(self, nutrition: dict[str, Any]) -> dict[str, Any]:
        calorie = int(nutrition.get("calorie", 0))
        protein = float(nutrition.get("protein_g", 0))
        title = "한 끼 분석"
        if calorie >= 600:
            summary = "열량이 높은 편이라 다음 식사량을 조절하는 편이 좋습니다."
        elif protein >= 20:
            summary = "단백질이 비교적 확보된 식사입니다."
        else:
            summary = "기록은 정상적으로 완료되었고, 전체 식단 균형은 누적 섭취량과 함께 보는 편이 좋습니다."
        return {
            "source": "fallback",
            "title": title,
            "summary": summary,
            "tips": [
                "채소나 단백질 반찬을 함께 먹으면 균형을 맞추기 쉽습니다.",
                "남은 칼로리 목표를 확인해 다음 식사를 조절해보세요.",
            ],
        }

    def _fallback_meal_insight(
        self,
        foods: list[dict[str, Any]],
        target_calories: int | None,
        remaining_calories: int | None,
    ) -> dict[str, Any]:
        total = sum(int(food.get("calorie", 0)) for food in foods)
        if target_calories and total > target_calories * 0.45:
            summary = "한 끼 비중이 큰 편이라 오늘 남은 식사에서 양 조절이 필요할 수 있습니다."
        elif remaining_calories is not None and remaining_calories < 250:
            summary = "오늘 남은 칼로리가 적어 가벼운 식사 구성이 더 적합합니다."
        else:
            summary = "영양 합계는 정상적으로 계산되었습니다. 다음 식사에서 부족한 영양소를 보완해보세요."
        return {
            "source": "fallback",
            "title": "식사 분석",
            "summary": summary,
            "tips": [
                "누적 단백질과 채소 섭취량을 함께 확인하세요.",
                "기록을 꾸준히 남기면 패턴 파악이 쉬워집니다.",
            ],
        }
