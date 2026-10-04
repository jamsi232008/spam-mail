@echo off
echo ========================================================
echo   SMART SPAM SHIELD - Automated Environment Setup
echo   AI-Powered Email Spam Detection and Automatic Filtering
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Python Virtual Environment (venv)...
if not exist "venv\Scripts\activate.bat" (
    echo [*] Creating virtual environment in .\venv ...
    python -m venv venv
)
if exist "venv\Scripts\activate.bat" (
    echo [*] Activating virtual environment...
    call venv\Scripts\activate.bat
)

echo.
echo [2/4] Installing Python Backend Dependencies...
python -m pip install -r backend\requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python dependencies. Please check Python installation.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Training Machine Learning Model (TF-IDF + Multinomial Naive Bayes)...
python backend\ml\train_model.py
if %errorlevel% neq 0 (
    echo [ERROR] Model training failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [4/4] Installing Frontend Node.js Dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install npm packages.
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo ========================================================
echo   SUCCESS: Setup Complete!
echo.
echo   To launch the application:
echo     1. Double-click start_backend.bat
echo     2. Double-click start_frontend.bat
echo     3. Open http://localhost:5173 in your web browser
echo ========================================================
pause

