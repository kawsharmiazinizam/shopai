@echo off
title ShopAI - Frontend Server
color 0B
echo.
echo  =============================================
echo    ShopAI Frontend - React + Tailwind CSS
echo  =============================================
echo.

cd /d "C:\Users\Kawshar Miazi Nizam\OneDrive\Desktop\python\ai_ecommerce_project\frontend"

echo Checking node_modules...
if not exist "node_modules" (
    echo Installing npm packages...
    npm install
)

echo.
echo  +-----------------------------------------+
echo  ^|  Frontend: http://localhost:3000         ^|
echo  ^|  Press Ctrl+C to stop                   ^|
echo  +-----------------------------------------+
echo.

npm start

pause
