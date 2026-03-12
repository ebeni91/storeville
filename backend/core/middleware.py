from django.conf import settings
from django.http import Http404
from apps.stores.models import Store
import logging

logger = logging.getLogger(__name__)

class SubdomainStoreMiddleware:
    """
    Intercepts every incoming request, checks the Host header for a subdomain,
    and dynamically attaches the correct Store object to the request context.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host().split(':')[0]
        # In production, this would be 'storeville.app'. Locally it might be 'localhost'
        base_domain = getattr(settings, 'BASE_DOMAIN', 'storeville.app')
        
        request.subdomain = None
        request.store_context = None

        # Detect if a subdomain is being used
        if host != base_domain and host.endswith(base_domain):
            # Isolate just the slug: 'abel-electronics.storeville.app' -> 'abel-electronics'
            subdomain = host.replace(f".{base_domain}", "")
            
            # Protect our core system routes
            if subdomain not in ['www', 'api', 'admin', 'dashboard']:
                request.subdomain = subdomain
                
                try:
                    # Fetch the active store based on the slug
                    store = Store.objects.get(slug=subdomain, is_active=True)
                    request.store_context = store
                except Store.DoesNotExist:
                    # Security: Log the failure, then hard-stop the request with a 404
                    logger.warning(f"Failed access attempt to non-existent store subdomain: {subdomain}")
                    raise Http404("Store not found or is currently inactive.")

        response = self.get_response(request)
        return response