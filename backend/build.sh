#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "📦 Installing Dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "⏳ Running Database Migrations..."
python manage.py migrate --noinput

echo "🎨 Collecting Static Files..."
python manage.py collectstatic --noinput --clear

echo "👤 Creating Superuser (if not exists)..."
python manage.py createsuperuser \
  --noinput \
  --username "${DJANGO_SUPERUSER_USERNAME:-admin}" \
  --email "${DJANGO_SUPERUSER_EMAIL:-admin@storeville.app}" \
  2>/dev/null || echo "✅ Superuser already exists, skipping."
