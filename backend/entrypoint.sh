#!/bin/sh
# entrypoint.sh — Docker entrypoint for StoreVille Backend
# Runs database migrations then starts the server (dev or prod mode)
set -e

echo "⏳ Running database migrations..."
python manage.py migrate --noinput

echo "📦 Collecting static files..."
python manage.py collectstatic --noinput --clear 2>/dev/null || true

echo "🚀 Starting server..."
exec "$@"
