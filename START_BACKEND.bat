@echo off
title ShopAI - Backend Server
color 0A
echo.
echo  =============================================
echo    ShopAI Backend - FastAPI + SQLite
echo  =============================================
echo.

cd /d "C:\Users\Kawshar Miazi Nizam\OneDrive\Desktop\python\ai_ecommerce_project\backend"

:: Check if venv exists
if not exist "venv\Scripts\activate.bat" (
    echo [1/3] Creating virtual environment...
    python -m venv venv
    echo     Done!
) else (
    echo [1/3] Virtual environment already exists. Skipping...
)

echo [2/3] Activating and installing packages...
call venv\Scripts\activate.bat
pip install -r requirements.txt -q

echo [3/3] Starting FastAPI server...
echo.
echo  +-----------------------------------------+
echo  ^|  API Running at: http://localhost:8000   ^|
echo  ^|  API Docs:       http://localhost:8000/docs ^|
echo  ^|  Press Ctrl+C to stop                   ^|
echo  +-----------------------------------------+
echo.

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
