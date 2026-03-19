@echo off
title Family Budget - Остановка
color 0C

echo.
echo ============================================
echo    🛑 Family Budget - Остановка сервисов
echo ============================================
echo.

echo [1/3] Принудительная остановка Docker...
docker-compose down --timeout 5 --remove-orphans

echo.
echo [2/3] Закрытие всех окон Family Budget...
for /f "tokens=2" %%i in ('tasklist /FI "WINDOWTITLE eq Family Budget*" /FO CSV ^| find "Family Budget"') do (
    taskkill /F /FI "WINDOWTITLE eq Family Budget*" 2>nul
)

echo.
echo [3/3] Готово!
timeout /t 2 /nobreak >nul

echo.
echo ✅ Все сервисы остановлены!
echo.
timeout /t 3
exit