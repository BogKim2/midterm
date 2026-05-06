# Prigio Setup Script (Windows PowerShell)
# 로컬 PostgreSQL + LMStudio + FastAPI + React 셋업

Write-Host "===== Prigio 설치 스크립트 =====" -ForegroundColor Green
Write-Host ""

# 1. PostgreSQL DB 생성
Write-Host "[1/4] PostgreSQL 데이터베이스 생성 중..." -ForegroundColor Cyan
try {
    & psql -U postgres -c "CREATE DATABASE prigio;" 2>$null
    Write-Host "  prigio DB 생성 완료" -ForegroundColor Green
} catch {
    Write-Host "  PostgreSQL이 실행 중이지 않거나 이미 DB가 존재합니다" -ForegroundColor Yellow
}

# 2. Backend 설정
Write-Host ""
Write-Host "[2/4] Backend 설정 중..." -ForegroundColor Cyan
Set-Location backend

# venv 생성
if (-not (Test-Path ".venv")) {
    python -m venv .venv
    Write-Host "  가상환경 생성 완료" -ForegroundColor Green
}

# 패키지 설치
Write-Host "  패키지 설치 중... (시간이 걸릴 수 있습니다)"
& .\.venv\Scripts\pip install -r requirements.txt -q
Write-Host "  패키지 설치 완료" -ForegroundColor Green

# RSA 키 생성
if (-not (Test-Path "keys/private.pem")) {
    New-Item -ItemType Directory -Force -Path keys | Out-Null
    & openssl genrsa -out keys/private.pem 2048 2>$null
    & openssl rsa -in keys/private.pem -pubout -out keys/public.pem 2>$null
    Write-Host "  JWT RSA 키 생성 완료" -ForegroundColor Green
}

# .env 생성
if (-not (Test-Path ".env")) {
    Copy-Item .env.example .env
    Write-Host "  .env 파일 생성됨 (Google OAuth 정보 입력 필요)" -ForegroundColor Yellow
}

Set-Location ..

# 3. Frontend 설정
Write-Host ""
Write-Host "[3/4] Frontend 설정 중..." -ForegroundColor Cyan
Set-Location frontend
& npm install --silent
Write-Host "  npm 패키지 설치 완료" -ForegroundColor Green
Set-Location ..

# 4. LMStudio 확인
Write-Host ""
Write-Host "[4/4] LMStudio 연결 확인 중..." -ForegroundColor Cyan
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:1234/v1/models" -TimeoutSec 3
    $count = $resp.data.Count
    Write-Host "  LMStudio 연결됨: $count개 모델 로드됨" -ForegroundColor Green
} catch {
    Write-Host "  LMStudio 미실행 (이후 시작하면 됩니다)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===== 설정 완료 =====" -ForegroundColor Green
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor White
Write-Host "  1. backend/.env 에서 GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET 입력"
Write-Host "  2. LMStudio 실행 후 비전 모델(Qwen2.5-VL 권장) 로드 + Server 시작"
Write-Host "  3. DB 마이그레이션:"
Write-Host "     cd backend"
Write-Host "     .\.venv\Scripts\activate"
Write-Host "     alembic upgrade head"
Write-Host ""
Write-Host "  4. 백엔드 실행:"
Write-Host "     uvicorn app.main:app --reload --port 8000"
Write-Host ""
Write-Host "  5. 프론트엔드 실행 (새 터미널):"
Write-Host "     cd frontend && npm run dev"
Write-Host ""
Write-Host "  6. 브라우저: http://localhost:5173"
