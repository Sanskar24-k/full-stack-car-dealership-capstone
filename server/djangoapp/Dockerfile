FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt ./
RUN python -m pip install --no-cache-dir -r requirements.txt
COPY . ./
RUN python manage.py collectstatic --noinput

ENV DJANGO_DEBUG=false DJANGO_DATABASE_PATH=/app/data/db.sqlite3 DJANGO_STATIC_ROOT=/app/static-collected
EXPOSE 8000
CMD ["sh", "-c", "mkdir -p /app/data && python manage.py migrate --noinput && python manage.py seed_cars && gunicorn dealership_project.wsgi:application --bind 0.0.0.0:8000 --workers 3 --access-logfile - --error-logfile -"]
