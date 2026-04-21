from .base import *
import os

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'storeville_db',
        'USER': 'storeville_user',
        'PASSWORD': 'super_secure_password',
        'HOST': 'postgres', # Docker service name
        'PORT': '5432',
    }
}

ALLOWED_HOSTS = [
    '*',
    '127.0.0.1',
    'localhost',
    'willette-conclusive-robby.ngrok-free.dev',
]

# 1. ALLOW THE BROWSER TO SEND COOKIES (CRITICAL)
CORS_ALLOW_CREDENTIALS = True

# 2. SIMPLE, EXPLICIT TRUSTED ORIGINS
# Local browser + ngrok tunnel (for Google OAuth & mobile device testing)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://willette-conclusive-robby.ngrok-free.dev",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://willette-conclusive-robby.ngrok-free.dev",
]

# NOTE: We have completely removed SESSION_COOKIE_DOMAIN and CSRF_COOKIE_DOMAIN.
# By leaving them blank, Django automatically locks the cookie to whatever domain 
# requested it (e.g., localhost), which is exactly what we want for a path-based app.