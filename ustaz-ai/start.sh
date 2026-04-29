#!/bin/bash
cd backend && pip install -r requirements.txt && uvicorn main:app --host 0.0000 --port 8000 &
cd frontend && pip install -r requirements.txt && API_URL="http://localhost:8000/api" streamlit run app.py --server.port 8501 &
wait
