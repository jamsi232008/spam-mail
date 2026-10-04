@echo off
echo ========================================================
echo   Starting SMART SPAM SHIELD Frontend (React + Vite)
echo   Opening on http://localhost:5173
echo ========================================================
echo.

cd /d "%~dp0\frontend"
call npm run dev
pause
