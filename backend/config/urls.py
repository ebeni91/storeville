from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def health_check(request):
    """Simple endpoint to verify the server is running."""
    return JsonResponse({"status": "healthy", "service": "StoreVille API"})

urlpatterns = [
    # System Admin
    path('admin/', admin.site.urls),
    
    # Health check for Docker/Kubernetes
    path('health/', health_check),
    
    # Active App Routes
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/stores/', include('apps.stores.urls')),
    path('api/retail/', include('apps.retail_catalog.urls')),
    path('api/food/', include('apps.food_menu.urls')),
    path('api/orders/retail/', include('apps.retail_orders.urls')),
    path('api/orders/food/', include('apps.food_orders.urls')),
    # path('api/payments/', include('apps.payments.urls')),
    # path('api/delivery/', include('apps.delivery.urls')),
]

# During local development, serve media files (images, logos) through Django
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)