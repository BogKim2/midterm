"""
SoriSori local-ai: faster-whisper STT + LM Studio (OpenAI-compatible) translation.
"""
from __future__ import annotations

import base64
import io
import json
import os
import re
import time
import wave
import urllib.request
from typing import Any, Optional

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from faster_whisper import WhisperModel

# ---- env ----
LOCAL_AI_HOST = os.environ.get("LOCAL_AI_HOST", "127.0.0.1")
LOCAL_AI_PORT = int(os.environ.get("LOCAL_AI_PORT", "8789"))

WHISPER_MODEL = os.environ.get("WHISPER_MODEL", "large-v3-turbo").strip()
WHISPER_DEVICE = os.environ.get("WHISPER_DEVICE", "cuda").strip().lower()
WHISPER_COMPUTE_TYPE = os.environ.get("WHISPER_COMPUTE_TYPE", "float16").strip()

LLM_BACKEND = os.environ.get("LOCAL_AI_LLM_BACKEND", "lmstudio").strip().lower()
LLM_URL = os.environ.get("LOCAL_AI_LLM_URL", "http://127.0.0.1:1234/v1").rstrip("/")
LLM_MODEL = os.environ.get("LOCAL_AI_LLM_MODEL", "qwen/qwen3.6-35b-a3b").strip()
LLM_TIMEOUT_S = float(os.environ.get("LOCAL_AI_LLM_TIMEOUT_S", "30"))
LLM_NUM_PREDICT = int(os.environ.get("LOCAL_AI_LLM_NUM_PREDICT", "512"))
LLM_TEMPERATURE = float(os.environ.get("LOCAL_AI_LLM_TEMPERATURE", "0.1"))
LLM_TOP_P = float(os.environ.get("LOCAL_AI_LLM_TOP_P", "0.9"))

LOCAL_AI_STT_BEAM_SIZE = int(os.environ.get("LOCAL_AI_STT_BEAM_SIZE", "5"))
LOCAL_AI_STT_VAD_FILTER = os.environ.get("LOCAL_AI_STT_VAD_FILTER", "true").strip().lower() in (
    "1",
    "true",
    "yes",
)
LOCAL_AI_STT_CONDITION_ON_PREVIOUS_TEXT = os.environ.get(
    "LOCAL_AI_STT_CONDITION_ON_PREVIOUS_TEXT", "false"
).strip().lower() in ("1", "true", "yes")
LOCAL_AI_STT_NO_SPEECH_THRESHOLD = float(os.environ.get("LOCAL_AI_STT_NO_SPEECH_THRESHOLD", "0.6"))
LOCAL_AI_STT_LOG_PROB_THRESHOLD = float(os.environ.get("LOCAL_AI_STT_LOG_PROB_THRESHOLD", "-1.0"))
LOCAL_AI_STT_COMPRESSION_RATIO_THRESHOLD = float(
    os.environ.get("LOCAL_AI_STT_COMPRESSION_RATIO_THRESHOLD", "2.4")
)

PROMPT_EN = os.environ.get(
    "LOCAL_AI_STT_INITIAL_PROMPT_EN",
    "Transcribe spoken English clearly. Keep natural words and punctuation.",
)
PROMPT_JA = os.environ.get(
    "LOCAL_AI_STT_INITIAL_PROMPT_JA",
    "Transcribe spoken Japanese in Japanese script. Do not use romaji.",
)

app = FastAPI(title="SoriSori Local AI", version="0.1.0")
_whisper: Optional[WhisperModel] = None


def _get_whisper() -> WhisperModel:
    global _whisper
    if _whisper is None:
        _whisper = WhisperModel(
            WHISPER_MODEL,
            device=WHISPER_DEVICE,
            compute_type=WHISPER_COMPUTE_TYPE,
        )
    return _whisper


def _initial_prompt_for_lang(lang: Optional[str]) -> Optional[str]:
    if not lang:
        return None
    if lang.startswith("ja"):
        return PROMPT_JA
    if lang.startswith("en"):
        return PROMPT_EN
    return None


def _pcm16_base64_to_float32(pcm_base64: str) -> np.ndarray:
    raw = base64.b64decode(pcm_base64)
    pcm = np.frombuffer(raw, dtype=np.int16)
    return (pcm.astype(np.float32)) / 32768.0


def _resample_linear_mono(audio_float32_mono: np.ndarray, orig_sr: int, target_sr: int = 16_000) -> np.ndarray:
    if orig_sr <= 0:
        raise ValueError("invalid sample_rate")
    if orig_sr == target_sr:
        return audio_float32_mono.astype(np.float32, copy=False)
    dur = audio_float32_mono.shape[0] / float(orig_sr)
    tgt_len = max(int(dur * target_sr), 1)
    x_old = np.linspace(0.0, 1.0, num=int(audio_float32_mono.shape[0]), endpoint=False, dtype=np.float64)
    x_new = np.linspace(0.0, 1.0, num=tgt_len, endpoint=False, dtype=np.float64)
    return np.interp(x_new, x_old, audio_float32_mono.astype(np.float64)).astype(np.float32)


def _looks_korean(text: str) -> bool:
    return bool(re.search(r"[\uac00-\ud7a3]", text))


def _http_json_post(url: str, payload: dict[str, Any], timeout_s: float) -> dict[str, Any]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout_s) as res:
        return json.loads(res.read().decode("utf-8"))


def _pick_lmstudio_assistant_text(data: dict[str, Any]) -> str:
    choices = data.get("choices")
    choice0 = choices[0] if isinstance(choices, list) and choices else {}
    msg = choice0.get("message", {}) if isinstance(choice0, dict) else {}
    if not isinstance(msg, dict):
        return ""

    content = str(msg.get("content") or "").strip()
    if content:
        return content

    reasoning = str(msg.get("reasoning_content") or "").strip()
    if not reasoning:
        return ""

    parts = re.findall(r"[\uac00-\ud7a3]+", reasoning)
    if not parts:
        return ""

    stitched = " ".join(parts[:32]).strip()
    return stitched


def _lmstudio_ping() -> tuple[bool, str]:
    try:
        url = f"{LLM_URL}/models"
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=3.0) as res:
            _ = json.loads(res.read().decode("utf-8"))
        return True, "ok"
    except Exception as exc:  # noqa: BLE001
        return False, str(exc)


def _lmstudio_translate(text: str, source_lang: str, target_lang: str = "ko") -> str:
    if LLM_BACKEND != "lmstudio":
        return ""

    if not text.strip():
        return ""

    url = f"{LLM_URL}/chat/completions"
    system_prompt = (
        "You are a professional Korean subtitle translator. "
        "/no_think "
        "Translate the user's transcript into natural Korean subtitles. "
        "Keep the meaning faithful. Keep it short and readable. "
        "Do not explain. Do not include markdown. Output only Korean."
    )
    user_prompt = (
        f"Source language: {source_lang}\n"
        f"Target language: Korean\n"
        f"Transcript:\n{text.strip()}"
    )
    payload: dict[str, Any] = {
        "model": LLM_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": LLM_TEMPERATURE,
        "top_p": LLM_TOP_P,
        "max_tokens": LLM_NUM_PREDICT,
        "stream": False,
        "chat_template_kwargs": {"enable_thinking": False},
    }
    try:
        data = _http_json_post(url, payload, LLM_TIMEOUT_S)
        return _pick_lmstudio_assistant_text(data).strip()
    except Exception:  # noqa: BLE001
        return ""


class TranslateRequest(BaseModel):
    text: str
    source_lang: str = Field(default="auto")
    target_lang: str = Field(default="ko")


class PcmRequest(BaseModel):
    sample_rate: int
    pcm_base64: str
    language: Optional[str] = None


class ProcessPcmRequest(PcmRequest):
    pass


@app.get("/health")
def health() -> dict[str, Any]:
    ok_lm, lm_detail = _lmstudio_ping()
    whisper_meta: dict[str, Any] = {
        "model": WHISPER_MODEL,
        "device": WHISPER_DEVICE,
        "compute_type": WHISPER_COMPUTE_TYPE,
        "loaded": _whisper is not None,
    }
    return {
        "ok": True,
        "stt": {"backend": "faster-whisper", **whisper_meta},
        "translation": {
            "llm_backend": LLM_BACKEND,
            "llm_url": LLM_URL,
            "llm_model": LLM_MODEL,
            "lmstudio_reachable": ok_lm,
            "lmstudio_detail": lm_detail,
        },
    }


def _translate_response(req: TranslateRequest) -> dict[str, Any]:
    text = req.text.strip()
    if not text:
        return {"text": "", "backend": LLM_BACKEND}

    src = req.source_lang.strip().lower() or "auto"
    out = _lmstudio_translate(text, src, req.target_lang)
    if not out.strip() or not _looks_korean(out):
        return {
            "text": text,
            "backend": LLM_BACKEND,
            "warning": "llm_empty_or_non_korean_fallback_to_source",
        }
    return {"text": out, "backend": LLM_BACKEND}


@app.post("/translate")
def translate(req: TranslateRequest) -> dict[str, Any]:
    return _translate_response(req)


@app.post("/transcribe_pcm")
def transcribe_pcm(req: PcmRequest) -> dict[str, Any]:
    t0 = time.perf_counter()
    audio = _pcm16_base64_to_float32(req.pcm_base64)
    if audio.size == 0:
        raise HTTPException(status_code=400, detail="empty_audio")

    audio = _resample_linear_mono(audio, int(req.sample_rate), 16_000)

    model = _get_whisper()
    kwargs: dict[str, Any] = {
        "beam_size": LOCAL_AI_STT_BEAM_SIZE,
        "vad_filter": LOCAL_AI_STT_VAD_FILTER,
        "condition_on_previous_text": LOCAL_AI_STT_CONDITION_ON_PREVIOUS_TEXT,
        "no_speech_threshold": LOCAL_AI_STT_NO_SPEECH_THRESHOLD,
        "log_prob_threshold": LOCAL_AI_STT_LOG_PROB_THRESHOLD,
        "compression_ratio_threshold": LOCAL_AI_STT_COMPRESSION_RATIO_THRESHOLD,
    }
    lang = req.language.strip() if req.language else None
    if lang:
        kwargs["language"] = lang
    ip = _initial_prompt_for_lang(lang)
    if ip:
        kwargs["initial_prompt"] = ip

    segments, info = model.transcribe(audio, **kwargs)
    parts: list[str] = []
    for s in segments:
        parts.append(s.text.strip())
    text = " ".join(p for p in parts if p).strip()
    stt_ms = int((time.perf_counter() - t0) * 1000)
    return {
        "text": text,
        "language": info.language,
        "language_probability": float(info.language_probability),
        "duration": float(info.duration),
        "sttMs": stt_ms,
    }


@app.post("/process_pcm")
def process_pcm(req: ProcessPcmRequest) -> dict[str, Any]:
    t_all = time.perf_counter()
    tr = transcribe_pcm(PcmRequest(**req.model_dump()))
    transcript = tr.get("text", "").strip()
    src_lang = str(tr.get("language") or "auto")

    t1 = time.perf_counter()
    translation_text = ""
    translate_backend = ""
    warning: Optional[str] = None
    if transcript:
        tres = _translate_response(TranslateRequest(text=transcript, source_lang=src_lang, target_lang="ko"))
        translation_text = str(tres.get("text", ""))
        translate_backend = str(tres.get("backend", ""))
        warning = tres.get("warning")  # type: ignore[assignment]

    translate_ms = int((time.perf_counter() - t1) * 1000)
    total_ms = int((time.perf_counter() - t_all) * 1000)
    return {
        **tr,
        "translation": translation_text,
        "translationBackend": translate_backend,
        "translateMs": translate_ms,
        "totalMs": total_ms,
        "warning": warning,
    }


@app.post("/transcribe_upload")
async def transcribe_upload(
    file: UploadFile = File(...),
    language: Optional[str] = None,
) -> dict[str, Any]:
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="empty_file")

    try:
        with wave.open(io.BytesIO(data), "rb") as wf:
            sr = wf.getframerate()
            nch = wf.getnchannels()
            sw = wf.getsampwidth()
            frames = wf.getnframes()
            raw = wf.readframes(frames)
        if sw != 2:
            raise HTTPException(
                status_code=400,
                detail="wav_must_be_pcm16",
            )

        pcm = np.frombuffer(raw, dtype=np.int16)
        if nch > 1:
            pcm = pcm.reshape(-1, nch).mean(axis=1).astype(np.int16)
        audio = (pcm.astype(np.float32)) / 32768.0
        audio = _resample_linear_mono(audio, int(sr), 16_000)
    except wave.Error as exc:
        raise HTTPException(
            status_code=400,
            detail=f"wav_read_failed_supported_format_is_pcm16_wave_only: {exc}",
        ) from exc

    t0 = time.perf_counter()
    model = _get_whisper()
    kwargs: dict[str, Any] = {
        "beam_size": LOCAL_AI_STT_BEAM_SIZE,
        "vad_filter": LOCAL_AI_STT_VAD_FILTER,
        "condition_on_previous_text": LOCAL_AI_STT_CONDITION_ON_PREVIOUS_TEXT,
        "no_speech_threshold": LOCAL_AI_STT_NO_SPEECH_THRESHOLD,
        "log_prob_threshold": LOCAL_AI_STT_LOG_PROB_THRESHOLD,
        "compression_ratio_threshold": LOCAL_AI_STT_COMPRESSION_RATIO_THRESHOLD,
    }
    lang = language.strip() if language else None
    if lang:
        kwargs["language"] = lang
    ip = _initial_prompt_for_lang(lang)
    if ip:
        kwargs["initial_prompt"] = ip

    segments, info = model.transcribe(audio, **kwargs)
    parts = [s.text.strip() for s in segments]
    text = " ".join(p for p in parts if p).strip()
    stt_ms = int((time.perf_counter() - t0) * 1000)
    return {
        "text": text,
        "language": info.language,
        "language_probability": float(info.language_probability),
        "duration": float(info.duration),
        "sampleRate": int(sr),
        "sttMs": stt_ms,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=LOCAL_AI_HOST, port=LOCAL_AI_PORT)
