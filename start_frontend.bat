@echo off
title Smart Spam Shield - Frontend Web App (Port 5173)
color 0B
echo ========================================================
echo   SMART SPAM SHIELD - Frontend UI (React + Vite)
echo   Listening on http://localhost:5173
echo ========================================================
echo.

cd /d "%~dp0\frontend"

echo [*] Checking for existing processes on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo [*] Freeing port 5173 (Process PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo [*] Checking Node.js / npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm was not found in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [*] Starting Vite development server...
echo [*] Opening UI on http://localhost:5173 ...
call npm run dev
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Frontend server stopped with error code %errorlevel%.
    pause
)
