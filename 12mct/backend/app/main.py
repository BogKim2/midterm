import io
import json
from pathlib import Path
from typing import Any

import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from .lmstudio import LMStudioClient

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

app = FastAPI(title="Meal Calorie Tracker API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROOT = Path(__file__).resolve().parent
NUTRITION_DB = json.loads((ROOT / "nutrition_db.json").read_text(encoding="utf-8"))
CLASS_INDICES = json.loads((ROOT / "class_indices.json").read_text(encoding="utf-8"))
MODEL_PATH = ROOT / "food_classifier.h5"

tf = None
ML_MODEL = None

try:
    import tensorflow as tf  # type: ignore

    if MODEL_PATH.exists():
        ML_MODEL = tf.keras.models.load_model(str(MODEL_PATH))
except Exception:
    ML_MODEL = None

lmstudio = LMStudioClient()


def preprocess_image(contents: bytes):
    image = Image.open(io.BytesIO(contents)).convert("RGB").resize((128, 128))
    array = np.array(image, dtype=np.float32)
    if tf is None:
        raise RuntimeError("TensorFlow not available")
    array = tf.keras.applications.mobilenet_v2.preprocess_input(array)
    return np.expand_dims(array, axis=0)


def prediction_to_response(food_class: str, confidence: float, *, image_bytes: bytes | None = None) -> dict[str, Any]:
    item = {"food_class": food_class, **NUTRITION_DB[food_class]}
    insight = lmstudio.analyze_food(nutrition=item, image_bytes=image_bytes, timeout_seconds=15)
    return {
        "predicted_class": food_class,
        "confidence": round(confidence, 3),
        "nutrition": item,
        "insight": insight,
    }


@app.get("/api/health")
def health_check():
    lm_state = lmstudio.health()
    return {
        "status": "ok",
        "ml_model_loaded": ML_MODEL is not None,
        "lmstudio_enabled": lm_state["enabled"],
        "lmstudio_reachable": lm_state.get("reachable", False),
        "lmstudio_model": lm_state["model"],
        "lmstudio_model_available": lm_state.get("model_available", False),
    }


@app.get("/api/categories")
def get_categories():
    categories = sorted({food["category"] for food in NUTRITION_DB.values()})
    return {"categories": categories}


@app.get("/api/foods")
def get_foods(category: str | None = None):
    if category:
        foods = {key: value for key, value in NUTRITION_DB.items() if value["category"] == category}
        if not foods:
            raise HTTPException(status_code=404, detail=f"Category '{category}' not found")
        return {"foods": foods}
    return {"foods": NUTRITION_DB}


@app.get("/api/nutrition/{food_class}")
def get_nutrition(food_class: str):
    item = NUTRITION_DB.get(food_class)
    if not item:
        raise HTTPException(status_code=404, detail=f"Food '{food_class}' not found")
    return {"food_class": food_class, **item}


@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()

    if ML_MODEL is not None and tf is not None:
        try:
            tensor = preprocess_image(contents)
            scores = ML_MODEL.predict(tensor, verbose=0)[0]
            index = int(np.argmax(scores))
            food_class = CLASS_INDICES[str(index)]
            return prediction_to_response(food_class, float(scores[index]), image_bytes=contents)
        except Exception:
            pass

    first_key = next(iter(NUTRITION_DB.keys()))
    return {
        **prediction_to_response(first_key, 0.0, image_bytes=contents),
        "note": "ML 모델을 사용하지 못해 기본 응답으로 대체했습니다.",
    }


@app.post("/api/predict-with-hint")
async def predict_with_hint(
    file: UploadFile = File(...),
    category: str = Form(...),
    top_k: int = Form(3),
):
    contents = await file.read()
    candidates = {key: value for key, value in NUTRITION_DB.items() if value["category"] == category}

    if not candidates:
        raise HTTPException(status_code=400, detail=f"Category '{category}' not found")

    if ML_MODEL is None or tf is None:
        sample_foods = list(candidates.items())[:top_k]
        results = [
            {
                "food_class": food_class,
                "confidence": round(1 / max(1, len(sample_foods)), 3),
                "nutrition": {"food_class": food_class, **food},
                "insight": lmstudio.analyze_food(
                    nutrition={"food_class": food_class, **food},
                    image_bytes=contents,
                ),
            }
            for food_class, food in sample_foods
        ]
        return {"hint_category": category, "top_predictions": results}

    try:
        tensor = preprocess_image(contents)
        scores = ML_MODEL.predict(tensor, verbose=0)[0]
        ranked = []
        for index_str, food_class in CLASS_INDICES.items():
            if food_class in candidates:
                ranked.append((food_class, float(scores[int(index_str)])))
        ranked.sort(key=lambda item: item[1], reverse=True)
        results = []
        for food_class, confidence in ranked[:top_k]:
            nutrition = {"food_class": food_class, **NUTRITION_DB[food_class]}
            results.append(
                {
                    "food_class": food_class,
                    "confidence": round(confidence, 3),
                    "nutrition": nutrition,
                    "insight": lmstudio.analyze_food(nutrition=nutrition, image_bytes=contents),
                }
            )
        return {"hint_category": category, "top_predictions": results}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/meal-insight")
async def meal_insight(payload: dict[str, Any]):
    foods = payload.get("foods") or []
    if not foods:
        raise HTTPException(status_code=400, detail="foods is required")

    insight = lmstudio.summarize_meal(
        foods=foods,
        target_calories=payload.get("target_calories"),
        remaining_calories=payload.get("remaining_calories"),
        timeout_seconds=180,
    )
    return insight
