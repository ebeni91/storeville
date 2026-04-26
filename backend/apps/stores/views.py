from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers
from core.permissions import IsSeller, IsStoreOwner
from .serializers import StoreManagementSerializer, StoreDiscoverySerializer
from .services import LocationService
from .models import Store
import logging

logger = logging.getLogger(__name__)


# ── Store Discovery (Public, Read-Only) ───────────────────────────────────────

class StoreDiscoveryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StoreDiscoverySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        # ✅ FIX: Explicit ordering and select_related for the new theme config
        # to prevent N+1 queries while maintaining the flattened API response.
        queryset = Store.objects.filter(is_active=True).select_related('theme_config').order_by('created_at')
        store_type = self.request.query_params.get('type')
        if store_type:
            queryset = queryset.filter(store_type=store_type.upper())
        return queryset

    @action(detail=False, methods=['get'])
    def by_slug(self, request):
        slug = request.query_params.get('slug')
        if not slug:
            return Response({"error": "Store slug is required."}, status=400)
        try:
            store = Store.objects.select_related('theme_config').get(slug=slug, is_active=True)
            serializer = self.get_serializer(store)
            return Response(serializer.data)
        except Store.DoesNotExist:
            return Response({"error": "Store not found."}, status=404)

    @action(detail=False, methods=['get'])
    def nearby(self, request):
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon') or request.query_params.get('lng')
        radius = float(request.query_params.get('radius', 15))
        store_type = request.query_params.get('type')

        if not lat or not lon:
            return Response({"error": "Latitude and longitude are required."}, status=400)

        try:
            stores = LocationService.get_nearby_stores(
                user_lat=lat,
                user_lon=lon,
                radius_km=float(radius),
                store_type=store_type
            )
            serializer = self.get_serializer(stores, many=True)
            return Response(serializer.data)
        except ValueError:
            return Response({"error": "Invalid coordinate format."}, status=400)


# ── Store Management (Seller-Only) ────────────────────────────────────────────

class StoreManagementViewSet(viewsets.ModelViewSet):
    serializer_class = StoreManagementSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsSeller(), IsStoreOwner()]

    def get_queryset(self):
        return Store.objects.filter(owner=self.request.user).select_related('theme_config')

    def perform_create(self, serializer):
        user = self.request.user
        # JIT Role Upgrade: Promote CUSTOMER → SELLER when they open their first store.
        if user.role == 'CUSTOMER':
            user.role = 'SELLER'
            user.save(update_fields=['role'])
            logger.info(f"[StoreManagement] Promoted user {user.id} to SELLER on first store creation.")

            # ✅ CRITICAL: Also update the Better Auth 'user' table.
            # The frontend session reads role directly from Better Auth's Postgres table.
            # If we only update the Django user, the BA session cookie still says CUSTOMER
            # and the frontend will route them as a buyer even after promotion.
            try:
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute(
                        'UPDATE "user" SET role = %s WHERE email = %s',
                        ['SELLER', user.email]
                    )
                    logger.info(f"[StoreManagement] Synced SELLER role to Better Auth table for {user.email}.")
            except Exception as e:
                logger.error(f"[StoreManagement] Failed to sync role to Better Auth table: {e}")

        serializer.save(owner=user)