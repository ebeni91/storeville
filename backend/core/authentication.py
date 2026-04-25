from rest_framework import authentication
from rest_framework import exceptions

class BetterAuthAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication for Better Auth.
    
    This class 'trusts' the user populated by BetterAuthMiddleware.
    Crucially, it does NOT enforce CSRF checks because Better Auth
    uses its own session token security in HttpOnly cookies.
    """
    
    def authenticate(self, request):
        # Access the underlying Django request object to avoid DRF recursion
        user = getattr(request._request, 'user', None)
        
        # If middleware resolved a genuine authenticated user, return it
        if user and user.is_authenticated:
            return (user, None)
            
        return None

    def enforce_csrf(self, request):
        """
        CSRF guard via custom header validation.

        The Next.js proxy (/api/proxy/[...path]/route.ts) injects
        'X-Requested-From: storeville-proxy' on every forwarded request.
        Browsers cannot set custom headers in cross-origin requests without a
        CORS preflight — which Django rejects for non-allowed origins.
        Therefore, any request reaching Django without this header is either:
          a) A direct cross-origin attack (CSRF)
          b) A mis-configured client
        Both cases are rejected with 403.

        Safe methods (GET, HEAD, OPTIONS) are exempt as they carry no side effects.
        """
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return  # Read-only requests are always safe
        if request.META.get('HTTP_X_REQUESTED_FROM') != 'storeville-proxy':
            raise exceptions.PermissionDenied(
                "Missing or invalid CSRF guard header. "
                "All state-mutating requests must originate from the StoreVille proxy."
            )
