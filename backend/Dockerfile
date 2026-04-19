FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Default to production settings; override with DJANGO_SETTINGS_MODULE env var
ENV DJANGO_SETTINGS_MODULE=config.settings.local

# Set work directory
WORKDIR /app

# Install system dependencies (needed for psycopg2 / postgres)
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy project
COPY . /app/

# Make entrypoint executable
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]

# Default: dev server. Override in prod compose with gunicorn command.
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]