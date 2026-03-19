@echo off
title Family Budget - Запуск
color 0A

echo.
echo ============================================
echo    🚀 Family Budget - Запуск всех сервисов
echo ============================================
echo.

echo [1/3] 🐘 Запуск базы данных (Docker)...
start "Family Budget - Docker" cmd /k "cd /d %~dp0 && docker-compose up -d && echo Docker запущен && pause"

timeout /t 5 /nobreak >nul

echo [2/3] ⚙️  Запуск бэкенда...
start "Family Budget - Backend" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [3/3] 🎨 Запуск фронтенда...
start "Family Budget - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ============================================
echo    ✅ Все сервисы запущены!
echo ============================================
echo.
echo 📌 Адреса:
echo    Фронтенд:  http://localhost:5173
echo    Бэкенд:    http://localhost:3000
echo    pgAdmin:   http://localhost:8080
echo.
echo 🛑 Для остановки выполни: docker-compose down
echo.
echo Это окно можно закрыть.
timeout /t 5 /nobreak >nul
exit