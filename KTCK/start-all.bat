@echo off
chcp 65001 >nul
color 0A
echo ============================================
echo   KHOI DONG FRUIT SHOP (Backend + Frontend)
echo ============================================
echo.

:: Kill any process on port 3000 and 4200
echo Đang dừng các server cũ...
taskkill /F /IM node.exe 2>nul
timeout /t 1 >nul

echo.
echo Khởi động Backend (port 3000)...
start "BACKEND - Fruit Shop" cmd /k "cd /d c:\Users\Admin\Documents\LTGDWEB\KTCK\backend && node server.js"

timeout /t 2 >nul

echo Khởi động Frontend (port 4200)...
start "FRONTEND - Fruit Shop" cmd /k "cd /d c:\Users\Admin\Documents\LTGDWEB\KTCK\frontend && npm start"

echo.
echo ============================================
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:4200
echo ============================================
echo.
pause
