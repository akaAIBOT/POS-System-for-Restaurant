@echo off
echo ========================================
echo  Wok'N'Cats POS - Zatrzymywanie...
echo ========================================
echo.

docker-compose down

if errorlevel 1 (
    echo [ERROR] Blad podczas zatrzymywania
    pause
    exit /b 1
)

echo.
echo [OK] Projekt zatrzymany pomyslnie!
echo.
pause
