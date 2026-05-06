SYNONYMS: dict[str, str] = {
    "파": "대파", "쪽파": "대파", "된장": "된장", "간장": "간장",
    "두부": "두부", "계란": "계란", "달걀": "계란",
    "돼지고기": "돼지고기", "소고기": "소고기", "닭고기": "닭고기",
    "오징어": "오징어", "새우": "새우", "김치": "김치",
}

def normalize_name(name: str) -> str:
    stripped = name.strip().lower()
    return SYNONYMS.get(stripped, stripped)
