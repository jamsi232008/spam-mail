@echo off
echo ========================================================
echo   Starting SMART SPAM SHIELD Backend Server (Flask)
echo   Listening on http://127.0.0.1:5000
echo ========================================================
echo.

cd /d "%~dp0"
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)
python backend\app.py
pause

