#!/bin/bash

echo "========================================"
echo " Wok'N'Cats POS - Zatrzymywanie..."
echo "========================================"
echo ""

docker-compose down

if [ $? -ne 0 ]; then
    echo "[ERROR] Blad podczas zatrzymywania"
    exit 1
fi

echo ""
echo "[OK] Projekt zatrzymany pomyslnie!"
echo ""
