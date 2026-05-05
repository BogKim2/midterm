@echo off
setlocal EnableExtensions

rem SoriSori dev stack - one CMD window per service.
rem Start LM Studio Local Server first: http://127.0.0.1:1234
rem Usage: run.bat            -> frees ports then starts stack
rem        run.bat desktop   -> includes Electron
rem        run.bat noclean    -> do NOT kill ports first (advanced)
rem        run.bat noclean desktop

set "ROOT=%~dp0"
set "KILL_PORTS=1"
set "WANT_DESKTOP=0"

if /i "%~1"=="noclean" set "KILL_PORTS=0"
if /i "%~2"=="noclean" set "KILL_PORTS=0"

if /i "%~1"=="desktop" set "WANT_DESKTOP=1"
if /i "%~2"=="desktop" set "WANT_DESKTOP=1"

where npm >nul 2>nul || (
  echo ERROR: npm not found. Install Node.js and add it to PATH.
  pause
  exit /b 1
)

if not exist "%ROOT%services\local-ai\.venv\Scripts\python.exe" (
  echo WARNING: services\local-ai\.venv missing - create venv per README first.
)

if "%KILL_PORTS%"=="1" (
  echo [SoriSori] Freeing ports 3000 8787 8788 8789...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$ports=3000,8787,8788,8789; foreach ($p in $ports) { Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }"
  timeout /t 2 /nobreak >nul
)

echo.
echo [SoriSori] Opening: local-ai, pipeline, realtime, web
echo [SoriSori] Browser: http://localhost:3000/session
echo [SoriSori] To kill ports only without starting: stop.bat
echo.

start "SoriSori: local-ai" /D "%ROOT%" cmd /k npm run dev:local-ai
timeout /t 2 /nobreak >nul

start "SoriSori: pipeline" /D "%ROOT%" cmd /k npm run dev:pipeline
timeout /t 1 /nobreak >nul

start "SoriSori: realtime" /D "%ROOT%" cmd /k npm run dev:realtime
timeout /t 1 /nobreak >nul

start "SoriSori: web" /D "%ROOT%" cmd /k npm run dev:web

if "%WANT_DESKTOP%"=="1" (
  timeout /t 1 /nobreak >nul
  start "SoriSori: desktop" /D "%ROOT%" cmd /k npm run dev:desktop
  echo [SoriSori] Electron desktop window started too.
) else (
  echo Desktop also: run.bat desktop
)

echo.
echo Close a window to stop that service.
echo If ports stay busy run: stop.bat
pause
endlocal
