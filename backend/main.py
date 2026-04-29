import os
import json
import httpx
import pandas as pd
import PyPDF2
from docx import Document
from io import BytesIO
from datetime import datetime, timedelta
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Body, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from google import genai
from google.genai import types
from pydantic import BaseModel, EmailStr, Field, validator
from jose import JWTError, jwt
from passlib.context import CryptContext
from database import SessionLocal, Student, Grade, ArchiveEntry, User

# Configuration for Security
SECRET_KEY = os.environ.get("SECRET_KEY", "super-secret-key-for-ustaz-ai-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 day

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

app = FastAPI(
    title="Ustaz-AI Pro Max API",
    description="Advanced AI System for Kazakhstan Teachers",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.environ.get("GEMINI_API_KEY", "")

def get_gemini_client():
    if not API_KEY:
        return None
    try:
        return genai.Client(api_key=API_KEY)
    except:
        return None

# --- AI Provider Helper (Groq as alternative free-tier provider) ---
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# --- Helper functions for file extraction ---
def extract_text_from_pdf(content: bytes) -> str:
    try:
        reader = PyPDF2.PdfReader(BytesIO(content))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"PDF Extraction error: {e}")
        return ""

def extract_text_from_docx(content: bytes) -> str:
    try:
        doc = Document(BytesIO(content))
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text.strip()
    except Exception as e:
        print(f"DOCX Extraction error: {e}")
        return ""

async def call_ai(prompt: str, system_instruction: str = "", response_json: bool = False):
    """
    Универсальный вызов ИИ. Если есть GROQ_API_KEY, используем Llama 3 (Groq).
    В противном случае откатываемся на Gemini.
    """
    if GROQ_API_KEY:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7
        }
        if response_json:
            payload["response_format"] = {"type": "json_object"}
            
        async with httpx.AsyncClient(timeout=30.0) as client_httpx:
            try:
                response = await client_httpx.post(GROQ_URL, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"Groq error: {e}. Falling back to Gemini.")
    
    # Fallback to Gemini (already configured)
    client = get_gemini_client()
    if not client:
        raise HTTPException(status_code=500, detail="AI Service Error: No API keys provided (GROQ or GEMINI)")
        
    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type='application/json' if response_json else 'text/plain'
            )
        )
        return response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")

# --- Security Helpers (Disabled Auth) ---
# We use a single global user for everything
GLOBAL_USER_ID = 1

def get_db():
    db = SessionLocal()
    try:
        # Ensure global user exists
        user = db.query(User).filter(User.id == GLOBAL_USER_ID).first()
        if not user:
            user = User(
                id=GLOBAL_USER_ID,
                username="ustaz_pro",
                email="pro@ustaz-ai.kz",
                hashed_password="no_password_needed",
                preferences='{"theme": "dark", "language": "ru", "notifications": true}'
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        yield db
    finally:
        db.close()

async def get_current_user(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == GLOBAL_USER_ID).first()
    return user

# --- Schemas ---
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)

class UserPreferences(BaseModel):
    theme: str
    language: str
    notifications: bool

class Token(BaseModel):
    access_token: str
    token_type: str

class KSPRequest(BaseModel):
    subject: str
    class_level: str
    topic: str

# --- Auth Routes (Disabled) ---
# Routes removed for security and simplicity as per request

@app.get("/api/auth/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "preferences": json.loads(current_user.preferences) if current_user.preferences else {}
    }

@app.put("/api/auth/profile")
async def update_profile(
    user_update: UserUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if user_update.username:
        # Check if username taken
        existing = db.query(User).filter(User.username == user_update.username).first()
        if existing and existing.id != current_user.id:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = user_update.username
    
    if user_update.email:
        existing = db.query(User).filter(User.email == user_update.email).first()
        if existing and existing.id != current_user.id:
            raise HTTPException(status_code=400, detail="Email already taken")
        current_user.email = user_update.email
    
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated successfully"}

@app.put("/api/auth/password")
async def change_password(
    pwd_in: PasswordChange, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Password change disabled in no-auth mode
    return {"message": "Смена пароля отключена в демо-режиме"}

@app.put("/api/auth/preferences")
async def update_preferences(
    prefs: UserPreferences, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    current_user.preferences = json.dumps(prefs.dict())
    db.commit()
    return {"message": "Preferences updated successfully"}

@app.post("/api/generate-ksp")
async def generate_ksp(req: KSPRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sys_prompt = """
    Ты - Senior методист Казахстана.
    Твоя задача написать идеальный Краткосрочный план (КСП) урока строго по Приказу №130 МОН РК.
    Верни ТОЛЬКО валидный JSON с полями:
    - title: Тема урока
    - goals: Цели обучения (из ГОСО)
    - lesson_goals: Цели урока (SMART)
    - criteria: Критерии оценивания
    - stages: Массив этапов урока [{"name": "Начало", "time": "10 мин", "activity": "Описание", "evaluation": "ФО"}]
    - resources: Ресурсы и оборудование
    """
    
    prompt = f"Предмет: {req.subject}, Класс: {req.class_level}, Тема: {req.topic}"
    
    try:
        content = await call_ai(prompt, system_instruction=sys_prompt, response_json=True)
        ksp_data = json.loads(content)
        
        # Сохраняем в архив
        archive = ArchiveEntry(
            user_id=current_user.id,
            content=json.dumps(ksp_data, ensure_ascii=False),
            metadata_json=json.dumps({
                "source": "ksp-generator", 
                "type": "КСП", 
                "title": req.topic, 
                "timestamp": str(datetime.now())
            })
        )
        db.add(archive)
        db.commit()
        
        return ksp_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/archive")
async def get_archive(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entries = db.query(ArchiveEntry).filter(ArchiveEntry.user_id == current_user.id).order_by(ArchiveEntry.id.desc()).limit(50).all()
    result = []
    for e in entries:
        try:
            meta = json.loads(e.metadata_json)
        except:
            meta = {"type": "Неизвестно"}
            
        result.append({
            "id": e.id,
            "title": meta.get("title", "Документ #" + str(e.id)),
            "type": meta.get("type", "Анализ"),
            "date": e.created_at.strftime("%d.%m.%Y %H:%M") if e.created_at else "Неизвестно",
            "content": e.content
        })
    return result

@app.post("/api/universal-input")
async def universal_input(
    file: UploadFile = File(None), 
    text: str = Body(None), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        if file:
            content = await file.read()
            mime_type = file.content_type
            filename = file.filename.lower()
            
            extracted_text = ""
            if filename.endswith(".pdf"):
                extracted_text = extract_text_from_pdf(content)
            elif filename.endswith(".docx"):
                extracted_text = extract_text_from_docx(content)
            
            if extracted_text:
                prompt = f"Проанализируй следующий текст из файла '{file.filename}':\n\n{extracted_text}\n\nВыдели ключевые требования, структуру и суть документа. Верни JSON: {{\"type\": \"document_analysis\", \"summary\": \"краткое описание\", \"data\": {{\"key_points\": []}}}}"
                res_content = await call_ai(prompt, response_json=True)
                res_data = json.loads(res_content)
            else:
                # Fallback to Vision for images or failed text extraction
                prompt = """
                Анализируй этот документ/аудио/фото. 
                Если это журнал: вытащи ФИО и оценки.
                Если это приказ/текст: вытащи ключевые требования.
                Верни JSON: {"type": "journal|legal|note", "data": {"students": [{"name": "ФИО", "sor1": 15, "sor2": 14, "soch": 30}]}, "summary": "краткое описание"}
                """
                
                client = get_gemini_client()
                if not client:
                    raise HTTPException(status_code=500, detail="Vision AI (Gemini) not configured.")

                response = client.models.generate_content(
                    model='gemini-1.5-flash',
                    contents=[
                        types.Part.from_bytes(data=content, mime_type=mime_type),
                        prompt
                    ],
                    config=types.GenerateContentConfig(response_mime_type='application/json')
                )
                res_data = json.loads(response.text)
        else:
            prompt = f"Преобразуй этот текст в структурированные данные для школы (Казахстан): {text}. Верни JSON."
            content = await call_ai(prompt, response_json=True)
            res_data = json.loads(content)

        archive = ArchiveEntry(
            user_id=current_user.id,
            content=json.dumps(res_data, ensure_ascii=False),
            metadata_json=json.dumps({"source": "universal-input", "filename": file.filename if file else "text", "timestamp": str(datetime.now())})
        )
        db.add(archive)
        db.commit()
        
        return res_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/resources/extract-text")
async def extract_resource_text(file: UploadFile = File(...)):
    content = await file.read()
    filename = file.filename.lower()
    
    text = ""
    if filename.endswith(".pdf"):
        text = extract_text_from_pdf(content)
    elif filename.endswith(".docx"):
        text = extract_text_from_docx(content)
    else:
        # For other files, maybe just return a placeholder or try to read as text
        try:
            text = content.decode('utf-8')
        except:
            text = "Не удалось извлечь текст из этого формата файла."
            
    return {"text": text, "filename": file.filename}

# Compatibility alias for UploadVision component
@app.post("/api/vision/parse-journal")
async def parse_journal_compatibility(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await universal_input(file=file, text=None, db=db, current_user=current_user)

@app.post("/api/smart-archive-search")
async def archive_search(
    query: str = Body(..., embed=True), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Улучшенный поиск: берем последние 20 записей пользователя
    entries = db.query(ArchiveEntry).filter(ArchiveEntry.user_id == current_user.id).order_by(ArchiveEntry.id.desc()).limit(20).all()
    context = "\n---\n".join([f"ID: {e.id} | Content: {e.content}" for e in entries])
    
    sys_prompt = "Ты - ассистент учителя. Твоя задача помогать искать информацию в его личном архиве документов."
    prompt = f"Используя следующие данные из архива:\n{context}\n\nВопрос учителя: {query}\n\nОтветь максимально точно. Если информации нет, предложи создать новый документ или КСП."
    
    answer = await call_ai(prompt, system_instruction=sys_prompt)
    return {"answer": answer}

@app.post("/api/brainstorm")
async def brainstorm_ideas(
    topic: str = Body(..., embed=True)
):
    sys_prompt = """
    Ты - эксперт по инновациям в образовании (EdTech) и методист-новатор.
    Твоя задача: генерировать прорывные, но практичные идеи для учителей Казахстана.
    Верни ответ в формате JSON с полями:
    - summary: Краткое описание концепции (1-2 предложения)
    - blocks: Массив объектов [{"title": "Заголовок блока", "content": "Детальное описание", "icon": "emoji"}]
    Блоки должны включать: 
    1. Методология (какой подход использовать: PBL, STEAM и т.д.)
    2. Цифровые инструменты (конкретные сервисы и как их применить)
    3. План активности (пошаговый сценарий интересного момента урока)
    4. Система оценивания (креативные способы ФО)
    5. Домашнее задание (необычный формат)
    6. "Фишка" (уникальная идея, которой можно удивить коллег и учеников)
    7. Рекомендация по Приказу 130 (как это соотносится с нормами)
    Учитывай контекст Казахстана: обновленное содержание, цифровизация, триединство языков.
    """
    prompt = f"Тема для мозгового штурма: {topic}\nПредложи комплексное инновационное решение для урока."
    
    try:
        content = await call_ai(prompt, system_instruction=sys_prompt, response_json=True)
        return json.loads(content)
    except Exception as e:
        # Fallback if AI fails or returns invalid JSON
        return {
            "summary": f"Идеи для темы: {topic}",
            "blocks": [
                {"title": "Методика", "content": "Используйте активные методы обучения (групповая работа, дискуссии).", "icon": "📚"},
                {"title": "Инструменты", "content": "Интерактивные доски, Kahoot, Quizlet.", "icon": "🛠️"},
                {"title": "Активности", "content": "Проведите квест или ролевую игру по теме.", "icon": "🎮"},
                {"title": "Оценивание", "content": "Формативное оценивание через дескрипторы.", "icon": "✅"}
            ]
        }

@app.post("/api/bulk-export")
async def bulk_export(data: dict = Body(...)):
    students = data.get("students", [])
    if not students:
        raise HTTPException(status_code=400, detail="Нет данных")
        
    df = pd.DataFrame(students)
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Анализ СОР_СОЧ')
        ksp_df = pd.DataFrame([{"Тема": "План на неделю", "Цели": "Согласно Приказу 130"}])
        ksp_df.to_excel(writer, index=False, sheet_name='КСП_Генерация')

    output.seek(0)
    return StreamingResponse(
        output, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=UstazAI_Report.xlsx"}
    )

@app.post("/api/legal-guardian")
async def legal_guardian(query: str = Body(..., embed=True)):
    # --- Preset Answers (Knowledge Base) ---
    presets = {
        "как отказаться от лишних отчетов": "Согласно Приказу №130 МОН РК, учитель обязан вести только 5 документов: 1. КСП, 2. КТП, 3. Классный журнал, 4. Проверка тетрадей, 5. Работа с родителями. Любые другие отчеты незаконны. Рекомендация: напишите служебную записку со ссылкой на Приказ №130.",
        "какие документы должен вести учитель": "Список документов строго регламентирован Приказом №130: КТП, КСП, электронный журнал, анализ СОР/СОЧ и документы по классному руководству. Все остальное — по желанию и за доплату.",
        "статус педагога": "Закон РК «О статусе педагога» гарантирует защиту от привлечения к несвойственным функциям, сокращение нагрузки и социальные льготы. За нарушение прав педагога предусмотрены штрафы для руководителей.",
    }
    
    query_lower = query.lower()
    for key, val in presets.items():
        if key in query_lower:
            return {"response": val, "law_ref": "Приказ №130 / Закон о статусе педагога"}

    sys_prompt = """
    Ты - «Қорғаушы» (Защитник), высококвалифицированный юридический ИИ-адвокат для учителей Казахстана.
    Твоя главная миссия: защищать права педагогов, опираясь исключительно на законы Республики Казахстан.
    
    Твоя база знаний:
    - Приказ Министра образования и науки РК № 125 (Критериальное оценивание).
    - Приказ Министра образования и науки РК № 130 (Оптимизация документооборота и защита от излишней отчетности).
    - Закон РК "О статусе педагога".
    
    Твой стиль общения:
    - Строгий, профессиональный, уверенный и поддерживающий.
    - Ты общаешься с учителем как его личный юрист.
    - В каждом ответе ты ОБЯЗАТЕЛЬНО должен давать точную ссылку на статью или пункт закона (например, "Согласно п. 14 Приказа №130...").
    - Если от учителя требуют лишние отчеты, ты должен четко сказать: "Это незаконно" и дать инструкцию, как отказаться.
    
    Формат ответа:
    1. Краткий и четкий ответ на вопрос.
    2. Юридическое обоснование (ссылка на закон).
    3. Рекомендация к действию.
    """
    response = await call_ai(query, system_instruction=sys_prompt)
    
    # Пытаемся вытащить ссылку на закон из текста для метаданных
    law_ref_match = "Закон РК О статусе педагога / Приказы №125, №130"
    if "Приказ" in response or "Закон" in response:
        # Простая эвристика для фронтенда, в реальном мире тут можно использовать структурированный вывод (JSON Schema)
        law_ref_match = "Нормативно-правовой акт РК найден"
        
    return {"response": response, "law_ref": law_ref_match}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
