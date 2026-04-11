from django.db import connection
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class BetterAuthMiddleware:
    """
    Direct-DB Authentication Middleware.
    
    Queries the better-auth tables in the shared Postgres database directly.
    - Zero-latency session verification (no HTTP round-trips).
    - Phone-only users (no email required).
    - JIT user synchronization.

    Cookie format notes (discovered via debugging):
    - Cookie name:  'better-auth.session_token'  (underscore, NOT hyphen)
    - Cookie value: '{token}.{url_encoded_hmac}'  (HMAC signature appended after a dot)
    - DB stores:    only the raw token BEFORE the dot
    """

    COOKIE_NAME = 'better-auth.session_token'

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. Only the Django Admin uses the standard Django session.
        #    Everything else goes through Better Auth session resolution.
        if request.path.startswith('/admin/'):
            return self.get_response(request)

        # 🌟 HYPER-IMPORTANT: By default, treat all platform requests as anonymous.
        # This prevents "sticky sessions" where the Django Admin session (e.g. et3on)
        # leaks into the customer storefront.
        # 2. Extract and parse the session token cookie.
        # It may be prefixed with __Secure- if running over HTTPS (like ngrok)
        raw_cookie = request.COOKIES.get('better-auth.session_token') or request.COOKIES.get('__Secure-better-auth.session_token')
        
        if not raw_cookie:
            return self.get_response(request)

        # Better Auth signs cookies as "{token}.{url_encoded_hmac}".
        # The DB session table only stores the raw token (before the dot).
        session_token = raw_cookie.split('.')[0]

        # 3. Direct DB query: validate session and fetch BA user data.
        auth_data = self._get_auth_data(session_token)

        if auth_data:
            # 4. Sync/locate the corresponding Django User.
            user = self._sync_user(auth_data)
            if user:
                user.backend = 'django.contrib.auth.backends.ModelBackend'
                request.user = user
                logger.debug(f"[BetterAuth] Authenticated: {user.email or user.username} (role={user.role})")
            else:
                logger.error(f"[BetterAuth] _sync_user returned None for BA data: {auth_data.get('email')}")
        else:
            logger.debug(f"[BetterAuth] No active session in DB for token prefix: {session_token[:8]}...")

        return self.get_response(request)

    def _get_auth_data(self, token: str) -> dict | None:
        """Query the better-auth 'session' and 'user' tables via raw SQL."""
        query = """
            SELECT 
                u.id, u.email, u.name, u.role, u.phone_number, u.image,
                s."expiresAt"
            FROM session s
            JOIN "user" u ON s."userId" = u.id
            WHERE s.token = %s
            AND s."expiresAt" > NOW()
            LIMIT 1
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute(query, [token])
                row = cursor.fetchone()
                if row:
                    return {
                        'id': row[0],
                        'email': row[1],
                        'name': row[2],
                        'role': row[3],
                        'phone_number': row[4],
                        'image': row[5],
                        'expires_at': row[6]
                    }
        except Exception as e:
            logger.error(f"BetterAuth Direct-DB query failed: {e}")
        return None

    def _sync_user(self, data: dict):
        """Map Better-Auth user data to Django User model (JIT sync)."""
        email = data.get('email')
        phone = data.get('phone_number')
        better_id = data.get('id')

        # Use email as username if available; otherwise derive from the BA ID.
        username = email if email else f"user_{better_id[:12]}"

        try:
            user = None
            if email:
                user = User.objects.filter(email=email).first()
            if not user and phone:
                user = User.objects.filter(phone_number=phone).first()
            if not user:
                user = User.objects.filter(username=username).first()

            if not user:
                # JIT creation — new BA user hitting an API endpoint for the first time.
                name_parts = data.get('name', '').split(' ', 1)
                user = User.objects.create(
                    username=username,
                    email=email or '',
                    first_name=name_parts[0] if len(name_parts) > 0 else '',
                    last_name=name_parts[1] if len(name_parts) > 1 else '',
                    role=data.get('role', 'CUSTOMER'),
                    phone_number=phone
                )
                user.set_unusable_password()
                user.save()
            else:
                # Role sync: only promote, never demote. Protect staff/admin roles.
                new_role = data.get('role', 'CUSTOMER')
                if user.role != new_role and not user.is_staff:
                    if user.role == 'CUSTOMER' and new_role == 'SELLER':
                        user.role = 'SELLER'
                        user.save(update_fields=['role'])

            return user
        except Exception as e:
            logger.error(f"BetterAuth User Sync failed: {e}")
            return None
