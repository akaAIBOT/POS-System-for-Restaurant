#!/bin/bash

echo "========================================"
echo " Wok'N'Cats POS - Uruchamianie..."
echo "========================================"
echo ""

# Sprawdz czy Docker jest uruchomiony
echo "[1/3] Sprawdzanie Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "[!] Docker nie jest uruchomiony!"
    echo "[!] Uruchom Docker Desktop i sprobuj ponownie"
    exit 1
fi

echo "[OK] Docker jest aktywny"
echo ""

echo "[2/3] Zatrzymywanie starych kontenerow..."
docker-compose down > /dev/null 2>&1

echo "[3/3] Uruchamianie kontenerow..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Blad podczas uruchamiania!"
    exit 1
fi

echo ""
echo "Czekam na uruchomienie serwisow (30 sekund)..."
sleep 30

echo ""
echo "========================================"
echo " SUKCES! Projekt uruchomiony!"
echo "========================================"
echo ""
echo "[+] Frontend:  http://localhost:3000"
echo "[+] Backend:   http://localhost:8000"
echo "[+] API Docs:  http://localhost:8000/docs"
echo ""
echo "Login: admin@restaurant.com"
echo "Haslo: admin123"
echo ""
echo "Aby zatrzymac projekt: ./stop.sh"
echo ""
