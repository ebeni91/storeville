import os
from .base import *

DEBUG = False

# Only allow the domains you explicitly own
ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'storeville.app').split(',')
BASE_DOMAIN = 'storeville.app'

# Secure Cookies
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Production Database (Credentials injected via environment variables)
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
# We must allow dynamic subdomains for CORS in production
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://\w+\.storeville\.app$",
]