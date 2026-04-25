FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Default to production settings. Override with DJANGO_SETTINGS_MODULE=config.settings.local
# in docker-compose.yml for local development — this prevents accidental prod deployment
# with DEBUG=True or ALLOWED_HOSTS=['*'] if the env var is missing.
ENV DJANGO_SETTINGS_MODULE=config.settings.production

# Set work directory
WORKDIR /app

# NOTE: No apt-get step needed — we use psycopg2-binary which is pre-compiled
# and bundles its own libpq. gcc/libpq-dev are only required for psycopg2 (source build).

# Install python dependencies (with retries for flaky network)
COPY requirements.txt /app/
RUN pip install --upgrade pip --timeout 120 --retries 5 \
    && pip install -r requirements.txt --timeout 120 --retries 5

# Copy project
COPY . /app/

# Make entrypoint executable
RUN chmod +x /app/entrypoint.sh

# ✅ SECURITY FIX (Issue #10): Run as non-root user.
# If the container is compromised, the attacker doesn't have root access.
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
RUN chown -R appuser:appgroup /app
USER appuser

ENTRYPOINT ["/app/entrypoint.sh"]

# Default: dev server. Override in prod compose with gunicorn command.
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]