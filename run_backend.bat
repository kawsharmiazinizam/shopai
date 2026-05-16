@echo off
echo ========================================
echo   ShopAI - Backend Setup and Run
echo ========================================

cd /d "C:\Users\Kawshar Miazi Nizam\OneDrive\Desktop\python\ai_ecommerce_project\backend"

echo [1/3] Creating virtual environment...
python -m venv venv

echo [2/3] Installing packages...
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo [3/3] Starting FastAPI server...
echo.
echo API will be at: http://localhost:8000
echo API Docs:       http://localhost:8000/docs
echo.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
