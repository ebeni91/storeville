from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from core.permissions import IsSeller, IsStoreOwner
from .serializers import StoreManagementSerializer, StoreDiscoverySerializer
from .services import LocationService
from .models import Store

class StoreDiscoveryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StoreDiscoverySerializer
    permission_classes = [AllowAny] 
    lookup_field = 'slug' 

    def get_queryset(self):
        queryset = Store.objects.filter(is_active=True)
        store_type = self.request.query_params.get('type')
        if store_type:
            queryset = queryset.filter(store_type=store_type.upper())
        return queryset

    # 🌟 THE FIX: Add the by_slug endpoint Next.js is looking for
    @action(detail=False, methods=['get'])
    def by_slug(self, request):
        slug = request.query_params.get('slug')
        
        if not slug:
            return Response({"error": "Store slug is required."}, status=400)
            
        try:
            # Find the active store matching this subdomain/slug
            store = Store.objects.get(slug=slug, is_active=True)
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
            
        queryset = Store.objects.filter(is_active=True)
        
        # Filter by RETAIL or FOOD if the parameter exists
        if store_type:
            queryset = queryset.filter(store_type=store_type.upper())
        
        try:
            # PASS THE STORE TYPE TO THE SERVICE
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
        
class StoreManagementViewSet(viewsets.ModelViewSet):
    serializer_class = StoreManagementSerializer
    
    def get_permissions(self):
        """
        - Allow any authenticated user to CREATE (POST) a store.
        - Require IsSeller and IsStoreOwner for other methods (LIST, RETRIEVE, UPDATE, DELETE).
        """
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsSeller(), IsStoreOwner()]

    def get_queryset(self):
        return Store.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        # 🌟 JIT ROLE UPGRADE: Promote to SELLER if they are currently a CUSTOMER
        if user.role == 'CUSTOMER':
            user.role = 'SELLER'
            user.save(update_fields=['role'])

            # 🌟 BETTER AUTH SYNC: Ensure the Next.js session sees the upgrade immediately
            from django.db import connection
            try:
                with connection.cursor() as cursor:
                    if user.email:
                        cursor.execute('UPDATE "user" SET role = %s WHERE email = %s', ['SELLER', user.email])
                    elif user.phone_number:
                        cursor.execute('UPDATE "user" SET role = %s WHERE phone_number = %s', ['SELLER', user.phone_number])
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Better Auth role sync failed: {e}")
            
        serializer.save(owner=user)