from .base import *
import os
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# ALLOWED_HOSTS = ['localhost', '127.0.0.1', '.storeville.app', '.localhost']

# Use SQLite for quick local testing if Postgres isn't running, 
# but ideally, stick to the Dockerized Postgres we set up in base.py
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


BASE_DOMAIN = 'storeville.test'

# Allow cookies to be shared across all subdomains
SESSION_COOKIE_DOMAIN = f".{BASE_DOMAIN}"
CSRF_COOKIE_DOMAIN = f".{BASE_DOMAIN}"

ALLOWED_HOSTS = [
    'storeville.test',
    'api.storeville.test',
    '.storeville.test',
    '127.0.0.1',
    'localhost',
]

# Allow the HttpOnly cookie to pass through
CORS_ALLOW_CREDENTIALS = True 

SAFE_DOMAIN = BASE_DOMAIN.replace('.', r'\.')

CORS_ALLOWED_ORIGIN_REGEXES = [
    rf"^http://([a-zA-Z0-9-]+\.)?{SAFE_DOMAIN}(:\d+)?$",
]

CSRF_TRUSTED_ORIGINS = [
    f"http://{BASE_DOMAIN}:3000",
    f"http://sami-caffee.{BASE_DOMAIN}:3000",
    f"http://api.{BASE_DOMAIN}:8000",
]