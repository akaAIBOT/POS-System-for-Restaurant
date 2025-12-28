@echo off
echo ========================================
echo  Wok'N'Cats POS - Uruchamianie...
echo ========================================
echo.

REM Sprawdz czy Docker Desktop jest uruchomiony
echo [1/4] Sprawdzanie Docker Desktop...
docker info >nul 2>&1
if errorlevel 1 (
    echo [!] Docker Desktop nie jest uruchomiony!
    echo [!] Uruchamiam Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo [*] Czekam 45 sekund na uruchomienie Docker...
    timeout /t 45 /nobreak >nul
)

echo [OK] Docker Desktop jest aktywny
echo.

echo [2/4] Zatrzymywanie starych kontenerow...
docker-compose down >nul 2>&1

echo [3/4] Uruchamianie kontenerow...
docker-compose up -d

if errorlevel 1 (
    echo.
    echo [ERROR] Blad podczas uruchamiania!
    echo Sprawdz czy Docker Desktop jest w pelni uruchomiony i sprobuj ponownie.
    pause
    exit /b 1
)

echo [4/4] Czekam na uruchomienie serwisow (30 sekund)...
timeout /t 30 /nobreak >nul

echo.
echo ========================================
echo  SUKCES! Projekt uruchomiony!
echo ========================================
echo.
echo [+] Frontend:  http://localhost:3000
echo [+] Backend:   http://localhost:8000
echo [+] API Docs:  http://localhost:8000/docs
echo.
echo Login: admin@restaurant.com
echo Haslo: admin123
echo.
echo Nacisnij dowolny klawisz aby otworzyc aplikacje...
pause >nul

start http://localhost:3000

echo.
echo Aby zatrzymac projekt, uruchom: stop.bat
echo.
pause
