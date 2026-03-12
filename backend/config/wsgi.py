import os
from django.core.wsgi import get_wsgi_application

# Default to local settings if not specified
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')

application = get_wsgi_application()