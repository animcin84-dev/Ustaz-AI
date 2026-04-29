import os
import json
import pandas as pd
from io import BytesIO
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Body, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
import google.generativeai as genai
from database import SessionLocal, Student, Grade, ArchiveEntry

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.environ.get("GEMINI_API_KEY", "")
genai.configure(api_key=API_KEY)

model_flash = genai.GenerativeModel('gemini-1.5-flash')
model_pro = genai.GenerativeModel('gemini-1.5-pro')

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/universal-input")
async def universal_input(file: UploadFile = File(None), text: str = Body(None), db: Session = Depends(get_db)):
    try:
        if file:
            content = await file.read()
            mime_type = file.content_type
            
            prompt = """
            Анализируй этот документ/аудио/фото. 
            Если это журнал: вытащи ФИО и оценки.
            Если это приказ/текст: вытащи ключевые требования.
            Если это аудио-заметка: преобразуй в структурированные данные.
            Верни JSON: {"type": "journal|legal|note", "data": {...}, "summary": "краткое описание"}
            """
            
            response = model_flash.generate_content([
                {'mime_type': mime_type, 'data': content},
                prompt
            ])
            res_data = json.loads(response.text.replace('```json', '').replace('```', '').strip())
        else:
            prompt = f"Преобразуй этот текст в структурированные данные для школы: {text}. Верни JSON."
            response = model_flash.generate_content(prompt)
            res_data = json.loads(response.text.replace('```json', '').replace('```', '').strip())

        # Save to archive (Smart Archive simulation)
        archive = ArchiveEntry(
            content=json.dumps(res_data),
            metadata_json=json.dumps({"source": "universal-input", "timestamp": str(datetime.now())})
        )
        db.add(archive)
        db.commit()
        
        return res_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/smart-archive-search")
async def archive_search(query: str = Body(..., embed=True), db: Session = Depends(get_db)):
    entries = db.query(ArchiveEntry).all()
    context = "\n".join([e.content for e in entries[-10:]]) # last 10 entries for context
    
    prompt = f"""
    Используя следующие данные из архива:
    {context}
    Ответь на вопрос: {query}
    Если данных нет, так и скажи.
    """
    response = model_pro.generate_content(prompt)
    return {"answer": response.text}

@app.post("/api/bulk-export")
async def bulk_export(data: dict = Body(...)):
    # Logic for KSP and SOR analysis generation
    # For now, we generate a combined Excel/PDF (simulated)
    students = data.get("students", [])
    df = pd.DataFrame(students)
    
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Анализ СОР_СОЧ')
        # Add a mock KSP sheet
        ksp_df = pd.DataFrame([{"Тема": "Алгебра 9 класс", "Цель": "Решение уравнений"}])
        ksp_df.to_excel(writer, index=False, sheet_name='КСП_Неделя')

    output.seek(0)
    return StreamingResponse(
        output, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=UstazAI_Bulk_Export.xlsx"}
    )

@app.post("/api/legal-guardian")
async def legal_guardian(query: str = Body(..., embed=True)):
    sys_prompt = "Ты - Legal Guardian для учителей РК. Ссылайся на Приказы 125 и 130. Выдавай четкие рекомендации."
    model = genai.GenerativeModel('gemini-1.5-pro', system_instruction=sys_prompt)
    response = model.generate_content(query)
    
    # In a real app, we'd generate a PDF here using wkhtmltopdf or similar.
    # We'll return the text for now.
    return {"response": response.text, "law_ref": "Приказ №125, ст. 4"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
