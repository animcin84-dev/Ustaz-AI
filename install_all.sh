#!/bin/bash

# Update system
sudo apt-get update
sudo apt-get install -y wkhtmltopdf python3-pip python3-venv sqlite3

# Backend Setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install google-genai pandas openpyxl sqlalchemy fastapi uvicorn
cd ..

# Frontend Setup
cd frontend
npm install
npm install framer-motion lucide-react recharts axios react-dropzone react-router-dom clsx tailwind-merge
cd ..

echo "Installation complete. To start the system, run ./start.sh"
