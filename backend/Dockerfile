FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --upgrade pip && pip install -r backend/requirements.txt

COPY backend ./backend
COPY alembic.ini ./alembic.ini

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]