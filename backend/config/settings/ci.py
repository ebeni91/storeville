"""
Django settings for CI/CD (GitHub Actions).

Inherits from base.py but uses environment variables for the database
so it works with GitHub Actions' PostgreSQL service container.
"""
from .base import *
import os

DEBUG = False

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'storeville_test'),
        'USER': os.environ.get('POSTGRES_USER', 'test_user'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'test_password'),
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

ALLOWED_HOSTS = ['*']

# Disable Redis cache in CI — use simple in-memory cache
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# Disable CORS restrictions in CI
CORS_ALLOW_ALL_ORIGINS = True
