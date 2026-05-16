@echo off
echo ============================================
echo  ShopAI - PostgreSQL Database Seed Script
echo ============================================
echo.

cd /d "C:\Users\Kawshar Miazi Nizam\OneDrive\Desktop\python\ai_ecommerce_project\backend"

echo [1/2] Activating virtual environment...
call venv\Scripts\activate.bat

echo [2/2] Running seed script (PostgreSQL)...
python seed_data.py

echo.
echo ============================================
echo  Done! Check output above for any errors.
echo ============================================
pause
