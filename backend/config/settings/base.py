import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
# Since this file is in config/settings/, BASE_DIR points to the 'backend' folder
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'fallback-insecure-key-for-dev')

# Application definition
INSTALLED_APPS = [
    'unfold',
    'unfold.contrib.filters',
    'unfold.contrib.forms',
    'unfold.contrib.inlines',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-Party Apps
    'rest_framework',
    'corsheaders',
    
    # Local Domain Apps
    'apps.accounts',
    'apps.stores',
    'apps.retail_catalog', 
    'apps.food_menu',
    'apps.retail_orders', 
    'apps.food_orders',
    'apps.payments',
    'apps.delivery',
]

# Order matters here! CORS must be at the top. Subdomain middleware should be near the end.
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    # better-auth: resolves session from Next.js auth server cookie
    'apps.accounts.middleware.BetterAuthMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

from corsheaders.defaults import default_headers
CORS_ALLOW_HEADERS = list(default_headers) + [
    'x-auth-zone',
]

ROOT_URLCONF = 'config.urls'

# 🌟 THE FIX: Disable automatic slash appending. 
# This prevents Django from trying to redirect POST requests (which breaks the payload).
APPEND_SLASH = False

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8}
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Point Django to our Role-Based Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# Internationalization & Localization (Ethiopian Market)
LANGUAGE_CODE = 'en-us' # Can add 'am' for Amharic later
TIME_ZONE = 'Africa/Addis_Ababa' # Critical for accurate order/delivery timestamps
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files (Store Logos, Banners, Product Images)
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── Redis Cache Backend ────────────────────────────────────────────────────────
# Uses Redis DB 1 (separate from Celery which typically uses DB 0)
# Cache timeout: 5 minutes for most data; overridden per-view where needed.
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': os.environ.get('REDIS_URL', 'redis://redis:6379/1'),
        'TIMEOUT': 300,  # 5 minutes global default
        'KEY_PREFIX': 'storeville',
    }
}

# ── Structured Logging ─────────────────────────────────────────────────────────
# JSON-formatted logs so Docker / Render log aggregation can index them properly.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(levelname)s %(name)s %(message)s',
        },
        'simple': {
            'format': '[%(levelname)s] %(name)s: %(message)s',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            # Use JSON in production (non-DEBUG), simple format in dev
            'formatter': 'json' if not os.environ.get('DEBUG', 'True') == 'True' else 'simple',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': os.environ.get('LOG_LEVEL', 'INFO'),
    },
    'loggers': {
        'django': {'handlers': ['console'], 'level': 'WARNING', 'propagate': False},
        'django.request': {'handlers': ['console'], 'level': 'ERROR', 'propagate': False},
        'apps': {'handlers': ['console'], 'level': 'DEBUG', 'propagate': False},
        'core': {'handlers': ['console'], 'level': 'DEBUG', 'propagate': False},
    },
}

# -----------------------------------------------------------------
# REST FRAMEWORK & SECURITY CONFIGURATIONS
# -----------------------------------------------------------------

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        # 🌟 THE BRIDGE: Trust the user resolved by BetterAuthMiddleware and skip CSRF checks
        'core.authentication.BetterAuthAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'EXCEPTION_HANDLER': 'core.exceptions.enterprise_exception_handler',
}

# better-auth server URL (the Next.js frontend)
BETTER_AUTH_URL = os.environ.get('BETTER_AUTH_URL', 'http://frontend:3000')


# ==============================================================================
# UNFOLD ADMIN DASHBOARD SETTINGS
# ==============================================================================

from django.templatetags.static import static

UNFOLD = {
    "SITE_TITLE": "StoreVille Premium Admin",
    "SITE_HEADER": "StoreVille Command Center",
    "SITE_URL": "http://localhost:3000",
    "SITE_SYMBOL": "speed",  # Material icon 
    "SHOW_HISTORY": True, 
    "SHOW_VIEW_ON_SITE": True,
    "DASHBOARD_CALLBACK": "core.dashboard.dashboard_callback",
    
    # COLORS
    "COLORS": {
        "primary": {
            "50": "238 242 255",
            "100": "224 231 255",
            "200": "199 210 254",
            "300": "165 180 252",
            "400": "129 140 248",
            "500": "99 102 241",  # Brand Indigo
            "600": "79 70 229",
            "700": "67 56 202",
            "800": "55 48 163",
            "900": "49 46 129",
        },
    },
    
    # SIDEBAR SPECIFICS
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": True,
        "navigation": [
            {
                "title": "Platform Management",
                "separator": True,
                "items": [
                    {
                        "title": "Dashboard",
                        "icon": "dashboard",
                        "link": "/admin/", 
                    },
                    {
                        "title": "Users & Drivers",
                        "icon": "people",
                        "link": "/admin/accounts/user/",
                    },
                    {
                        "title": "Registered Stores",
                        "icon": "storefront",
                        "link": "/admin/stores/store/",
                    },
                ],
            },
            {
                "title": "Commerce Engines",
                "separator": True,
                "items": [
                    {
                        "title": "Retail Products",
                        "icon": "inventory_2",
                        "link": "/admin/retail_catalog/retailproduct/",
                    },
                    {
                        "title": "Food Menu",
                        "icon": "restaurant_menu",
                        "link": "/admin/food_menu/menuitem/",
                    },
                    {
                        "title": "Retail Orders",
                        "icon": "shopping_cart",
                        "link": "/admin/retail_orders/retailorder/",
                    },
                    {
                        "title": "Food Orders",
                        "icon": "delivery_dining",
                        "link": "/admin/food_orders/foodorder/",
                    },
                ]
            },
            {
                "title": "Logistics & Finance",
                "separator": True,
                "items": [
                    {
                        "title": "Deliveries",
                        "icon": "local_shipping",
                        "link": "/admin/delivery/delivery/",
                    },
                    {
                        "title": "Payments",
                        "icon": "payments",
                        "link": "/admin/payments/paymenttransaction/",
                    },
                ]
            }
        ],
    },
}