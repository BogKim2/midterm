@echo off
setlocal

cd /d "%~dp0"
set "UV_CACHE_DIR=%CD%\.uv-cache"
if not exist "%UV_CACHE_DIR%" mkdir "%UV_CACHE_DIR%"

echo [1/5] Checking uv...
where uv >nul 2>nul
if errorlevel 1 (
  echo uv is not installed or not on PATH.
  echo Install uv first: https://docs.astral.sh/uv/
  exit /b 1
)

echo [2/5] Syncing environment...
call uv sync
if errorlevel 1 (
  echo uv sync failed.
  exit /b 1
)

echo [3/5] Checking LM Studio local API...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$endpoint='http://127.0.0.1:1234/v1/models';" ^
  "try {" ^
  "  $models = Invoke-RestMethod -Method Get -Uri $endpoint;" ^
  "  $preferred = $models.data | Where-Object { $_.id -eq 'qwen/qwen3.6-35b-a3b' } | Select-Object -First 1;" ^
  "  if (-not $preferred) { $preferred = $models.data | Where-Object { $_.id -like '*qwen3.6*' } | Select-Object -First 1 }" ^
  "  if ($preferred) {" ^
  "    $settings = @{ llm = @{ enabled = $true; endpoint = 'http://127.0.0.1:1234/v1'; model_name = $preferred.id; timeout_seconds = 20.0; max_tokens = 1200 } } | ConvertTo-Json -Depth 4;" ^
  "    Set-Content -LiteralPath 'smart_doc_analyzer.settings.json' -Value $settings -Encoding UTF8;" ^
  "    Write-Host ('LM Studio connected. Using model: ' + $preferred.id);" ^
  "  } else {" ^
  "    Write-Warning 'LM Studio is running but no qwen3.6 model was found. The app will keep its current settings.';" ^
  "  }" ^
  "} catch {" ^
  "  Write-Warning 'LM Studio local API is not reachable. The app will still start with rule-based analysis only.';" ^
  "}"

echo [4/5] Running tests...
call uv run pytest
if errorlevel 1 (
  echo Tests failed.
  pause
  exit /b 1
)

echo [5/5] Launching app...
call uv run python -m smart_doc_analyzer
if errorlevel 1 (
  echo App exited with an error.
  pause
  exit /b 1
)
exit /b 0
