#!/bin/bash

# Ustaz-AI Pro Max - Boot Sequence
echo -e "\e[1;36m=========================================\e[0m"
echo -e "\e[1;36m   USTAZ-AI PRO MAX (2026 EDITION)     \e[0m"
echo -e "\e[1;36m=========================================\e[0m"

# Настройка виртуального окружения
if [ ! -d "venv" ]; then
    echo -e "\e[1;33m[+] Creating Python Virtual Environment...\e[0m"
    python3 -m venv venv
fi

source venv/bin/activate

echo -e "\e[1;34m[+] Installing Backend Dependencies...\e[0m"
cd backend
pip install -r requirements.txt --quiet
cd ..

echo -e "\e[1;34m[+] Installing Frontend Dependencies...\e[0m"
cd frontend
npm install --quiet
cd ..

echo -e "\e[1;32m[+] Igniting FastAPI Engine (Legal AI / Vision AI)...\e[0m"
cd backend
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

echo -e "\e[1;32m[+] Booting Vite Engine (Framer Motion / Liquid Glass)...\e[0m"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "\n\e[1;32m✅ ALL SYSTEMS GO!\e[0m"
echo -e "🚀 Backend API: \e[4;36mhttp://localhost:8000\e[0m"
echo -e "🎨 UI Client:   \e[4;36mhttp://localhost:5173\e[0m"
echo -e "\n\e[1;31mPress Ctrl+C to terminate the ecosystem.\e[0m\n"

# Ожидание остановки
trap "echo -e '\n\e[1;31mShutting down gracefully...\e[0m'; kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
