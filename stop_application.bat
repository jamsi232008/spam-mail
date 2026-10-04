@echo off
title Smart Spam Shield - Stop Services
color 0C
echo ========================================================
echo   Stopping Smart Spam Shield Services...
echo ========================================================
echo.

echo [*] Terminating Backend process (Port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    echo [*] Stopping PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo [*] Terminating Frontend process (Port 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo [*] Stopping PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ========================================================
echo   [OK] All Smart Spam Shield services have been stopped.
echo ========================================================
echo.
pause
