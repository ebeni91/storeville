"""
URL configuration for core project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 1. Orders App (Priority High)
    # This sends any request starting with 'api/orders/' to backend/orders/urls.py
    path('api/orders/', include('orders.urls')),
    
    # 2. Users App
    path('api/users/', include('users.urls')),
    
    # 3. Stores App (Priority Low / Catch-all)
    # This captures 'api/stores/' and potentially 'api/<slug>/' depending on your config
    path('api/', include('stores.urls')),
]

# Enable media serving in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)