@echo off
echo ============================================
echo  ShopAI - GitHub Upload Script
echo ============================================
echo.

cd /d "C:\Users\Kawshar Miazi Nizam\OneDrive\Desktop\python\ai_ecommerce_project"

echo [1/5] Initializing Git (if not already done)...
git init

echo [2/5] Adding all files...
git add .

echo [3/5] Creating commit...
git commit -m "ShopAI production ready - PostgreSQL + Render deploy"

echo [4/5] Setting branch to main...
git branch -M main

echo.
echo ============================================
echo  STOP! এখন GitHub এ repo তৈরি করো:
echo  1. github.com এ যাও
echo  2. New Repository -> "shopai" নাম দাও
echo  3. Public রাখো, README বানিও না
echo  4. repo URL কপি করো (https://github.com/username/shopai.git)
echo  5. এখানে paste করো:
echo ============================================
echo.
set /p REPO_URL="GitHub Repo URL: "

echo [5/5] Pushing to GitHub...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git push -u origin main

echo.
echo ============================================
echo  GitHub upload complete!
echo  এখন render.com এ deploy করো
echo ============================================
pause
