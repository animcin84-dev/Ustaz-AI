# Ustaz-AI 🇰🇿 (V2)

**Интеллектуальный помощник педагога с функцией локального сохранения и экспорта в PDF.**

## 🌟 Что нового в V2 (Product Version)
1. **Export Master:** Генерация и скачивание красивых официальных PDF-документов с шапкой и местом для подписи (стандарты РК 2026).
2. **Local Storage:** Встроенная SQLite база данных автоматически сохраняет всю историю сгенерированных отчетов (СОР/СОЧ) и КСП.
3. **Prompt Engineering 2.0:** Улучшенное качество генерации (строгие ссылки на Приказы №125 и №130).

## 🚀 Инструкция по развертыванию в интернете (Бесплатно)

Чтобы отправить ссылку на работающее приложение жюри конкурса Q-IDEA, мы можем использовать **Streamlit Cloud** или **Replit Deploy**. Самый быстрый способ (так как у нас Fullstack на Python) — **Replit**.

### Способ 1. Запуск через Replit (Рекомендуется)
1. Зарегистрируйтесь на [replit.com](https://replit.com/).
2. Нажмите **"Create Repl"**, выберите **"Python"** и назовите его `ustaz-ai`.
3. Перетащите (или скопируйте) все файлы из нашей папки `ustaz-ai` в файловый менеджер Replit.
4. Создайте секрет (Environment Variable):
   - Перейдите в меню `Secrets` (или иконка замочка слева).
   - Введите Key: `GEMINI_API_KEY`
   - Введите Value: `ваш_реальный_ключ_от_google`
5. *Опционально:* Чтобы работал экспорт в PDF на сервере Replit (там нужен wkhtmltopdf), откройте Shell (терминал внизу) и введите:
   ```bash
   apt-get update && apt-get install -y wkhtmltopdf
   ```
6. Нажмите большую кнопку **"Run"** в Replit.
   - Скрипт запустит backend и frontend. Replit автоматически выдаст вам публичную веб-ссылку на порт 8501 (Frontend).
   - Эту ссылку `https://ваше-имя.repl.co` можно отправлять жюри!

### Способ 2. Альтернативный запуск (GitHub + Streamlit Cloud + Render)
1. Загрузите папку `backend` на GitHub как отдельный репозиторий и задеплойте его на [Render.com](https://render.com) (Web Service, Free Tier).
2. Обновите в `frontend/app.py` переменную `API_URL` на URL вашего Render (например, `https://ustaz-backend.onrender.com/api`).
3. Загрузите папку `frontend` на GitHub как отдельный репозиторий.
4. Перейдите на [Streamlit Cloud](https://share.streamlit.io/), подключите GitHub и выберите `frontend/app.py`.
5. В настройках Streamlit Advanced Settings добавьте `GEMINI_API_KEY`. (Хотя ключ нужен только бекенду, так что этот шаг для фронта не обязателен).

## 🛠 Технический стек
* **Frontend:** Streamlit + Requests
* **Backend:** FastAPI, SQLite3
* **AI:** Google Generative AI (Gemini Pro)
* **Export:** Markdown + PDFKit (wkhtmltopdf)
