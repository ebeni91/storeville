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

# The base domain for subdomain routing (e.g., storeville.app)
BASE_DOMAIN = os.environ.get('BASE_DOMAIN', 'storeville.app')

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
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist', # Allows us to securely log users out
    'corsheaders',
    
    # Local Domain Apps
    'apps.accounts',
    'apps.stores',
    'apps.retail_catalog', 
    'apps.food_menu',
    'apps.retail_orders', 
    'apps.food_orders',
    # 'apps.orders',
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
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
    # Our Custom Multi-Tenant Middleware
    'core.middleware.SubdomainStoreMiddleware',
]

from corsheaders.defaults import default_headers
CORS_ALLOW_HEADERS = list(default_headers) + [
    'x-auth-zone',
]

ROOT_URLCONF = 'config.urls'

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

# -----------------------------------------------------------------
# REST FRAMEWORK & SECURITY CONFIGURATIONS
# -----------------------------------------------------------------

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated', # Secure by default
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    # Custom Enterprise Error Handler
    'EXCEPTION_HANDLER': 'core.exceptions.enterprise_exception_handler', 
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}


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