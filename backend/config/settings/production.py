import os
import dj_database_url
from .base import *

DEBUG = False

# Configure allowed hosts for deployment
# Automatically includes Render's assigned domain (e.g. your-app.onrender.com)
RENDER_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'storeville.app').split(',')
if RENDER_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_HOSTNAME)

BASE_DOMAIN = 'storeville.app'

# Secure Cookies
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Production Database (Credentials injected via environment variables)
# Render passes the entire connection string as DATABASE_URL
db_url = os.environ.get('DATABASE_URL')
if db_url:
    DATABASES = {
        'default': dj_database_url.config(
            default=db_url,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    # Fallback to explicit vars if DATABASE_URL is missing
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('POSTGRES_DB'),
            'USER': os.environ.get('POSTGRES_USER'),
            'PASSWORD': os.environ.get('POSTGRES_PASSWORD'),
            'HOST': os.environ.get('POSTGRES_HOST'),
            'PORT': os.environ.get('POSTGRES_PORT', '5432'),
        }
    }

# Strict CORS for production - only your frontends can talk to this API
CORS_ALLOWED_ORIGINS = [
    "https://storeville.app",
    "https://admin.storeville.app",
]

# Allow requests from the dynamic Vercel frontend URL
FRONTEND_URL = os.environ.get('FRONTEND_URL')
if FRONTEND_URL:
    # Ensure no trailing slash
    clean_url = FRONTEND_URL.rstrip('/')
    if clean_url not in CORS_ALLOWED_ORIGINS:
        CORS_ALLOWED_ORIGINS.append(clean_url)

# We must allow dynamic subdomains for CORS in production
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://\w+\.storeville\.app$",
]