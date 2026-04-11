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
        By overriding this and doing nothing, we tell DRF to skip CSRF checks
        for requests using this authentication class.
        """
        return
