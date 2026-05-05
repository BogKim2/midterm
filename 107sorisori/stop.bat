@echo off
setlocal EnableExtensions

rem Stop SoriSori dev listeners (Next 3000, realtime 8787, pipeline 8788, local-ai 8789).
rem Use when you see EADDRINUSE or WinError 10048.

echo [SoriSori] Stopping LISTEN on ports 3000 8787 8788 8789 ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ports=3000,8787,8788,8789; foreach ($p in $ports) { Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } }"
echo Done.
pause
endlocal
