from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
import google.generativeai as genai
import os
import sqlite3
import markdown
import pdfkit
import pandas as pd
import io
import json
from datetime import datetime
from dotenv import load_dotenv
from PIL import Image

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def init_db():
    conn = sqlite3.connect("ustaz.db")
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS history 
                      (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                       type TEXT, 
                       title TEXT, 
                       content TEXT, 
                       created_at TEXT)''')
    conn.commit()
    conn.close()

init_db()

def save_to_db(doc_type: str, title: str, content: str):
    conn = sqlite3.connect("ustaz.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO history (type, title, content, created_at) VALUES (?, ?, ?, ?)", 
                   (doc_type, title, content, datetime.now().strftime("%Y-%m-%d %H:%M")))
    conn.commit()
    conn.close()

class ReportRequest(BaseModel):
    subject: str
    class_number: str
    grades: str
    language: str

class LessonPlanRequest(BaseModel):
    topic: str
    learning_objectives: str
    duration_mins: int = 45
    language: str

class ChatRequest(BaseModel):
    query: str
    language: str

class PDFRequest(BaseModel):
    content: str

def get_gemini_response(prompt: str, model_name: str = 'gemini-1.5-flash', image=None) -> str:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY error")
    try:
        model = genai.GenerativeModel(model_name)
        if image:
            response = model.generate_content([prompt, image])
        else:
            response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

PROMPT_SUFFIX = """
Всегда оформляй ответ в виде красивого официального документа. В начале добавь официальную шапку (Министерство просвещения РК, место для названия школы, дата), а в конце - место для подписи (ФИО, должность) и отметку 'М.П.' (место печати), согласно стандартам делопроизводства РК 2026 года.
"""

@app.post("/api/report-genius")
async def report_genius(req: ReportRequest):
    prompt = f"""
    Действуй как завуч. Напиши анализ СОР/СОЧ по предмету '{req.subject}' для {req.class_number} класса. Язык: {req.language}. Данные об оценках: {req.grades}.
    Учти стандарты РК 2026, Приказ №125.
    {PROMPT_SUFFIX}
    """
    report = get_gemini_response(prompt)
    
    analytics_prompt = f"Извлеки из текста '{req.grades}' только цифры оценок (например, от 2 до 5 или баллы от 0 до 100), верни JSON-список чисел. Если это список ФИО и оценок, извлеки только оценки. Верни только валидный JSON массив чисел, без markdown."
    try:
        grades_json = get_gemini_response(analytics_prompt)
        grades_list = json.loads(grades_json.strip('` \njson'))
        if not all(isinstance(x, (int, float)) for x in grades_list):
            grades_list = []
    except:
        grades_list = []

    analytics_data = {"labels": [], "values": [], "quality": 0, "success": 0}
    if grades_list:
        df = pd.DataFrame(grades_list, columns=['grade'])
        counts = df['grade'].value_counts().sort_index()
        analytics_data["labels"] = [str(x) for x in counts.index.tolist()]
        analytics_data["values"] = counts.values.tolist()
        
        if df['grade'].max() <= 5:
            success = (df['grade'] >= 3).mean() * 100
            quality = (df['grade'] >= 4).mean() * 100
        else:
            success = (df['grade'] >= 40).mean() * 100
            quality = (df['grade'] >= 70).mean() * 100
        analytics_data["quality"] = round(quality, 1)
        analytics_data["success"] = round(success, 1)

    save_to_db("Отчет", f"{req.subject} {req.class_number}", report)
    return {"report": report, "analytics": analytics_data}

@app.post("/api/lesson-planner")
async def lesson_planner(req: LessonPlanRequest):
    prompt = f"""
    Действуй как методист. Составь КСП. Язык: {req.language}. Тема: {req.topic}. Цели: {req.learning_objectives}. Время: {req.duration_mins} мин.
    Учти Приказ №130. {PROMPT_SUFFIX}
    """
    result = get_gemini_response(prompt)
    save_to_db("КСП", req.topic, result)
    return {"plan": result}

@app.post("/api/vision-assistant")
async def vision_assistant(file: UploadFile = File(...), language: str = Form(...)):
    try:
        image = Image.open(io.BytesIO(await file.read()))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image")
    
    prompt = f"""
    Распознай ФИО учеников и их оценки с этого изображения журнала.
    Верни строго JSON массив объектов с ключами "student" и "grade".
    Никакого дополнительного текста или markdown блоков.
    """
    result = get_gemini_response(prompt, image=image)
    try:
        clean_json = result.strip('` \njson')
        data = json.loads(clean_json)
        return {"data": data}
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to parse JSON from AI response: " + result)

@app.post("/api/methodist-ai")
async def methodist_ai(req: ChatRequest):
    prompt = f"Ты 'Methodist AI', ИИ-консультант. Отвечай на {req.language}, опираясь на Приказ №125 и №130 РК 2026. Вопрос: {req.query}"
    return {"answer": get_gemini_response(prompt)}

@app.get("/api/history")
async def get_history():
    try:
        conn = sqlite3.connect("ustaz.db")
        cursor = conn.cursor()
        cursor.execute("SELECT id, type, title, created_at FROM history ORDER BY id DESC")
        rows = cursor.fetchall()
        conn.close()
        return [{"id": r[0], "type": r[1], "title": r[2], "created_at": r[3]} for r in rows]
    except:
        return []

@app.get("/api/history/{item_id}")
async def get_history_item(item_id: int):
    conn = sqlite3.connect("ustaz.db")
    cursor = conn.cursor()
    cursor.execute("SELECT content FROM history WHERE id = ?", (item_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"content": row[0]}
    raise HTTPException(status_code=404)

@app.post("/api/generate-pdf")
async def generate_pdf(req: PDFRequest):
    html_content = markdown.markdown(req.content, extensions=['tables'])
    html = f"<html><head><meta charset='utf-8'><style>body {{ font-family: sans-serif; padding: 20px; }} table {{ border-collapse: collapse; width: 100%; }} th, td {{ border: 1px solid black; padding: 8px; }}</style></head><body>{html_content}</body></html>"
    try:
        pdf_bytes = pdfkit.from_string(html, False, options={"encoding": "UTF-8", "quiet": ""})
        return Response(content=pdf_bytes, media_type="application/pdf")
    except Exception:
        raise HTTPException(status_code=500, detail="PDF Error")

@app.post("/api/generate-excel")
async def generate_excel(data: list):
    df = pd.DataFrame(data)
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    output.seek(0)
    return Response(content=output.read(), media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

@app.post("/api/generate-csv")
async def generate_csv(data: list):
    df = pd.DataFrame(data)
    output = io.StringIO()
    df.to_csv(output, index=False)
    return Response(content=output.getvalue(), media_type="text/csv")
