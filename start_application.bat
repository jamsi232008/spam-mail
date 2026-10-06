@echo off
title Smart Spam Shield - Master Launcher
color 0F
cls
echo ===================================================================
echo             SMART SPAM SHIELD - AI EMAIL PROTECTION SYSTEM
echo ===================================================================
echo.
echo  [1/4] Preparing runtime environment...
cd /d "%~dp0"

echo  [2/4] Starting AI Backend Server (Port 5000)...
start "Smart Spam Shield - Backend Server" cmd /c "start_backend.bat"

echo  [3/4] Starting Frontend Web Interface (Port 5173)...
start "Smart Spam Shield - Frontend Interface" cmd /c "start_frontend.bat"

echo  [4/4] Waiting for services to initialize...
timeout /t 4 /nobreak >nul

echo.
echo ===================================================================
echo   [SUCCESS] Smart Spam Shield is now running!
echo.
echo   * Web App (Unified) : http://localhost:5000
echo   * Dev UI (Vite)     : http://localhost:5173
echo   * Backend Health    : http://127.0.0.1:5000/api/health
echo   * Demo Login        : demo@spamshield.ai / password123
echo.
echo   * Public Share Link : Run 'share_public_link.bat' to share
echo                         with anyone on any phone or device!
echo ===================================================================
echo.
echo Opening dashboard in your default browser...
start http://localhost:5000

echo.
echo Keep this window open or minimize it.
echo To completely stop both servers, run stop_application.bat.
echo.
pause
