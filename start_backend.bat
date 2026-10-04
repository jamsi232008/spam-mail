@echo off
title Smart Spam Shield - Backend Server (Port 5000)
color 0A
echo ========================================================
echo   SMART SPAM SHIELD - AI Backend Server
echo   Listening on http://127.0.0.1:5000
echo ========================================================
echo.

cd /d "%~dp0"

echo [*] Checking for existing processes on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    echo [*] Freeing port 5000 (Process PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo [*] Detecting Python environment...
set PYTHON_CMD=python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    py -3 --version >nul 2>&1
    if %errorlevel% equ 0 (
        set PYTHON_CMD=py -3
    ) else (
        echo [ERROR] Python was not found in PATH!
        echo Please ensure Python 3.10+ is installed.
        pause
        exit /b 1
    )
)

if exist "venv\Scripts\activate.bat" (
    echo [*] Activating local virtual environment...
    call venv\Scripts\activate.bat
    set PYTHON_CMD=python
)

echo [*] Starting Flask server using %PYTHON_CMD%...
echo [*] Accessible at: http://127.0.0.1:5000
echo ========================================================
echo.

%PYTHON_CMD% backend\app.py
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Backend exited with error code %errorlevel%.
    pause
)
