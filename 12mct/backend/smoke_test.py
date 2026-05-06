from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app


def main() -> None:
    client = TestClient(app)

    health = client.get("/api/health")
    print("health", health.status_code, health.json())

    categories = client.get("/api/categories")
    print("categories", categories.status_code, len(categories.json().get("categories", [])))

    insight = client.post(
        "/api/meal-insight",
        json={
            "foods": [
                {
                    "name_ko": "비빔밥",
                    "category": "밥/면류",
                    "calorie": 560,
                    "carbs_g": 79,
                    "protein_g": 19,
                    "fat_g": 16,
                }
            ],
            "target_calories": 2000,
            "remaining_calories": 800,
        },
    )
    print("meal-insight", insight.status_code, insight.json())

    image_path = Path(r"F:\03llm\112mealcalorie\meal-calorie-tracker\frontend\src\assets\hero.png")
    with image_path.open("rb") as file:
        predict = client.post("/api/predict", files={"file": ("hero.png", file, "image/png")})
    body = predict.json()
    print("predict", predict.status_code, body["predicted_class"], body["insight"]["source"])


if __name__ == "__main__":
    main()
