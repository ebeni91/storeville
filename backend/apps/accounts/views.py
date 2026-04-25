from rest_framework import generics, permissions, status, viewsets
from .serializers import UserSerializer, CustomerAddressSerializer, SavedPaymentMethodSerializer
from .models import CustomerAddress, SavedPaymentMethod
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
import logging
import json
import os

User = get_user_model()
logger = logging.getLogger(__name__)


class SyncUserView(APIView):
    """
    🌟 Internal server-to-server endpoint.
    Called by Better Auth's databaseHooks.user.create.after hook
    when a new user registers. This ensures every BA signup immediately
    creates a corresponding Django user in the Admin dashboard.

    ✅ SECURITY: Protected by a shared secret (INTERNAL_SYNC_SECRET).
    Never expose raw exception details in responses.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
    
        expected = os.environ.get('INTERNAL_SYNC_SECRET', '')
        if not expected or expected == 'dev-sync-secret':
            from django.core.exceptions import ImproperlyConfigured
            raise ImproperlyConfigured(
                "INTERNAL_SYNC_SECRET must be set to a strong, unique value. "
                "Never use the default 'dev-sync-secret' in production."
            )

        secret = request.headers.get('X-Internal-Secret', '')
        import hmac as _hmac
        if not _hmac.compare_digest(secret, expected):
            logger.warning("[SyncUser] Rejected request with invalid X-Internal-Secret")
            return Response({'error': 'Forbidden'}, status=403)

        data = request.data
        email = data.get('email', '')
        name = data.get('name', '') or ''
        phone = data.get('phone_number') or None

        # 🔒 SECURITY FIX: Enforce a role allowlist for user registration.
        # The Better Auth hook can send any role string. We must never allow
        # a registration webhook to create a SUPER_ADMIN or STAFF account.
        # New users from registration are always CUSTOMER — role is promoted
        # later via the JIT upgrade flow in the middleware.
        _REGISTRATION_ROLE_ALLOWLIST = {'CUSTOMER'}
        requested_role = data.get('role', 'CUSTOMER')
        role = requested_role if requested_role in _REGISTRATION_ROLE_ALLOWLIST else 'CUSTOMER'

        name_parts = name.split(' ', 1)
        first_name = name_parts[0] if len(name_parts) > 0 else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        try:
            username = email if email else f'phone_{phone}'

            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email or '',
                    'first_name': first_name,
                    'last_name': last_name,
                    'role': role,
                    'phone_number': phone,
                }
            )

            if created:
                user.set_unusable_password()
                user.save()
                logger.info(f'[SyncUser] Created Django user: {username}')
            else:
                logger.info(f'[SyncUser] User already exists: {username}')

            return Response({'status': 'ok', 'created': created}, status=200)

        except Exception as e:
            
            logger.error(f'[SyncUser] Failed to sync BA user: {e}', exc_info=True)
            return Response({'error': 'Internal server error'}, status=500)



class ProfileView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class CustomerAddressViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerAddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CustomerAddress.objects.filter(user=self.request.user)

class SavedPaymentMethodViewSet(viewsets.ModelViewSet):
    serializer_class = SavedPaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedPaymentMethod.objects.filter(user=self.request.user)