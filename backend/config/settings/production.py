import os
import dj_database_url
from .base import *

DEBUG = False

# ── Cache backend ──────────────────────────────────────────────────────────────
# base.py points CACHES at redis://redis:6379/1 (Docker hostname).
# On Render's free tier there is no Redis service, so that hostname never
# resolves. Any cache.get / cache.set call would raise ConnectionError and
# silently break parts of the app (map discovery, etc.).
#
# Override here: use Redis when REDIS_URL is injected (paid tier / upgrade),
# fall back to in-process LocMemCache otherwise.  LocMemCache is cleared on
# every dyno restart but that is fine — it is only used for short-lived
# acceleration, not session or auth storage.
_REDIS_URL = os.environ.get('REDIS_URL')
if _REDIS_URL:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': _REDIS_URL,
            'TIMEOUT': 300,
            'KEY_PREFIX': 'storeville',
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'storeville-cache',
        }
    }


# Configure allowed hosts for deployment
# Automatically includes Render's assigned domain (e.g. your-app.onrender.com)
RENDER_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'storeville.app').split(',')
if RENDER_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_HOSTNAME)

# Always explicitly trust the custom API subdomain
if 'api.storeville.app' not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append('api.storeville.app')

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

# 🌟 CRITICAL: Django expects the exact origin to be explicitly trusted for POST requests
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS.copy()

# ── Security Headers ─────────────────────────────────────────────────────────
# These headers instruct the browser to enforce HTTPS, prevent clickjacking,
# and block MIME-type sniffing attacks.
SECURE_HSTS_SECONDS = 31536000          # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
# Tell Django to trust the X-Forwarded-Proto header set by Nginx.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
# Redirect http:// → https:// at the Django layer (belt-and-suspenders with Nginx).
SECURE_SSL_REDIRECT = True