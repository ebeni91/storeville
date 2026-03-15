from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Wildcard allowed hosts for local testing with subdomains
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '.storeville.app', '.localhost']

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

# CORS settings for local Next.js frontend
CORS_ALLOW_CREDENTIALS = True

# Ensure your frontend is specifically allowed
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Add your subdomains here later if needed
]