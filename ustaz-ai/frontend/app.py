import streamlit as st
import requests
import os
import pandas as pd

st.set_page_config(page_title="Ustaz-AI", layout="wide")

API_URL = os.getenv("API_URL", "http://127.0.0.1:8000/api")

st.markdown("""
<style>
    :root { --primary-color: #00A650; }
    .stButton>button { background-color: var(--primary-color); color: white; border-radius: 8px; width: 100%; }
    .card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-top: 1rem; color: black; }
</style>
""", unsafe_allow_html=True)

lang = st.sidebar.radio("Тіл / Язык", ["Қазақша", "Русский"])
is_kz = lang == "Қазақша"

def check_db():
    try:
        res = requests.get(f"{API_URL}/history", timeout=2)
        return "🟢 " + ("Қосылды" if is_kz else "Подключено") if res.status_code == 200 else "🔴 " + ("Қате" if is_kz else "Ошибка")
    except:
        return "🔴 " + ("Қосылмаған" if is_kz else "Нет связи")

st.sidebar.markdown(f"**DB Status:** {check_db()}")

menu = st.sidebar.selectbox("Меню / Мәзір", [
    "Report Genius", 
    "Lesson Planner", 
    "Vision Assistant", 
    "Methodist AI",
    "History"
])

def download_pdf(content, filename):
    res = requests.post(f"{API_URL}/generate-pdf", json={"content": content})
    if res.status_code == 200:
        st.download_button("PDF", data=res.content, file_name=filename, mime="application/pdf")

if menu == "Report Genius":
    st.header("БЖБ/ТЖБ талдау" if is_kz else "Анализ СОР/СОЧ")
    with st.form("report"):
        subj = st.text_input("Пән" if is_kz else "Предмет")
        cls = st.text_input("Сынып" if is_kz else "Класс")
        grades = st.text_area("Бағалар" if is_kz else "Оценки")
        if st.form_submit_button("Құру" if is_kz else "Сгенерировать") and subj and cls and grades:
            with st.spinner("..."):
                res = requests.post(f"{API_URL}/report-genius", json={"subject": subj, "class_number": cls, "grades": grades, "language": lang})
                if res.status_code == 200:
                    data = res.json()
                    st.markdown(f"<div class='card'>{data['report']}</div>", unsafe_allow_html=True)
                    download_pdf(data['report'], f"Report_{subj}_{cls}.pdf")
                    if data['analytics']['labels']:
                        st.subheader("Deep Analytics")
                        df = pd.DataFrame({"Баға/Оценка": data['analytics']['labels'], "Саны/Кол-во": data['analytics']['values']})
                        st.bar_chart(df.set_index("Баға/Оценка"))
                        st.metric("Сапа/Качество", f"{data['analytics']['quality']}%")
                        st.metric("Үлгерім/Успеваемость", f"{data['analytics']['success']}%")

elif menu == "Lesson Planner":
    st.header("ҚМЖ" if is_kz else "КСП")
    with st.form("ksp"):
        topic = st.text_input("Тақырып" if is_kz else "Тема")
        obj = st.text_area("Мақсаттар" if is_kz else "Цели")
        dur = st.number_input("Уақыт" if is_kz else "Время", 15, 90, 45)
        if st.form_submit_button("Құру" if is_kz else "Создать") and topic and obj:
            with st.spinner("..."):
                res = requests.post(f"{API_URL}/lesson-planner", json={"topic": topic, "learning_objectives": obj, "duration_mins": dur, "language": lang})
                if res.status_code == 200:
                    st.markdown(f"<div class='card'>{res.json()['plan']}</div>", unsafe_allow_html=True)
                    download_pdf(res.json()['plan'], "KSP.pdf")

elif menu == "Vision Assistant":
    st.header("Vision Assistant (Kundelik.kz Export)")
    file = st.file_uploader("Фото", type=["jpg", "jpeg", "png"])
    if file and st.button("Тану" if is_kz else "Распознать"):
        with st.spinner("..."):
            res = requests.post(f"{API_URL}/vision-assistant", files={"file": file.getvalue()}, data={"language": lang})
            if res.status_code == 200:
                data = res.json()['data']
                df = pd.DataFrame(data)
                st.dataframe(df)
                col1, col2 = st.columns(2)
                xls_res = requests.post(f"{API_URL}/generate-excel", json=data)
                if xls_res.status_code == 200:
                    col1.download_button("Excel", xls_res.content, "kundelik.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                csv_res = requests.post(f"{API_URL}/generate-csv", json=data)
                if csv_res.status_code == 200:
                    col2.download_button("CSV", csv_res.content, "kundelik.csv", "text/csv")
            else:
                st.error("Қате" if is_kz else "Ошибка")

elif menu == "Methodist AI":
    st.header("Methodist AI")
    q = st.text_input("Сұрақ" if is_kz else "Вопрос")
    if st.button("Сұрау" if is_kz else "Спросить") and q:
        with st.spinner("..."):
            res = requests.post(f"{API_URL}/methodist-ai", json={"query": q, "language": lang})
            if res.status_code == 200:
                st.markdown(f"<div class='card'>{res.json()['answer']}</div>", unsafe_allow_html=True)

elif menu == "History":
    st.header("Тарих" if is_kz else "История")
    try:
        history = requests.get(f"{API_URL}/history").json()
        for item in history:
            with st.expander(f"{item['type']} | {item['title']} ({item['created_at']})"):
                c_res = requests.get(f"{API_URL}/history/{item['id']}")
                if c_res.status_code == 200:
                    content = c_res.json()['content']
                    st.markdown(content)
                    download_pdf(content, f"doc_{item['id']}.pdf")
    except:
        st.error("Қате" if is_kz else "Ошибка")
