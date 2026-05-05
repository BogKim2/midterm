from __future__ import annotations

import json
from pathlib import Path

from smart_doc_analyzer.core.models import AnalysisResult


def export_analysis_to_json(result: AnalysisResult, path: Path) -> None:
    path.write_text(json.dumps(result.to_dict(), ensure_ascii=False, indent=2), encoding="utf-8")
