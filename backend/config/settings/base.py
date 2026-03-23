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
    'jazzmin',
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

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [], # Add template directories here if needed later
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
# JAZZMIN ADMIN DASHBOARD SETTINGS
# ==============================================================================
JAZZMIN_SETTINGS = {
    "site_title": "StoreVille Admin",
    "site_header": "StoreVille",
    "site_brand": "StoreVille HQ",
    "site_logo": None, # You can add a path to your logo in static files later
    "welcome_sign": "Welcome to StoreVille Command Center",
    "copyright": "StoreVille Technology",
    # "search_model": ["accounts.User", "stores.Store", "orders.Order","retail_orders.RetailOrder","food_orders.FoodOrder"],
    "user_avatar": None,
    
    # Top Menu
    "topmenu_links": [
        {"name": "Home",  "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "Visit Site", "url": "http://localhost:3000", "new_window": True},
        {"model": "accounts.User"},
    ],

    # Custom Icons for Apps and Models
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "accounts.User": "fas fa-user-shield",
        "stores.Store": "fas fa-store",
        "products.Product": "fas fa-box-open",
        "products.Category": "fas fa-tags",
        "orders.Order": "fas fa-shopping-cart",
        "orders.OrderItem": "fas fa-receipt",
        "payments.PaymentTransaction": "fas fa-credit-card",
        "delivery.Delivery": "fas fa-truck",
        # The Food Engine
        "food_menu.MenuCategory": "fas fa-list",
        "food_menu.MenuItem": "fas fa-hamburger",
        "food_orders.FoodOrder": "fas fa-motorcycle",
        
        # The Retail Engine
        "retail_catalog.RetailCategory": "fas fa-tags",
        "retail_catalog.RetailProduct": "fas fa-box-open",
        "retail_orders.RetailOrder": "fas fa-shopping-cart",
        
        # Logistics & Finance
        "payments.PaymentTransaction": "fas fa-credit-card",
        "delivery.Delivery": "fas fa-truck",
    },
    
    "show_ui_builder": False,
    "changeform_format": "horizontal_tabs",
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-indigo",
    "accent": "accent-indigo",
    "navbar": "navbar-indigo navbar-dark",
    "no_navbar_border": False,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-indigo",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": True,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "default",
    "dark_mode_theme": "darkly",
    "button_classes": {
        "primary": "btn-indigo",
        "secondary": "btn-outline-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success"
    }
}