from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from core.permissions import IsSeller, IsStoreOwner
from .serializers import StoreManagementSerializer
from .services import LocationService
from .serializers import StoreDiscoverySerializer

class StoreDiscoveryViewSet(viewsets.ViewSet):
    """
    Public API for the map-based discovery interface.
    """
    permission_classes = [AllowAny] # Anyone can browse the map

    @action(detail=False, methods=['get'])
    def nearby(self, request):
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')
        radius = request.query_params.get('radius', 10)
        category = request.query_params.get('category')

        if not lat or not lon:
            return Response({"error": "Latitude and longitude are required."}, status=400)

        try:
            # Pass to our service layer
            stores = LocationService.get_nearby_stores(
                user_lat=lat, 
                user_lon=lon, 
                radius_km=float(radius), 
                category=category
            )
            
            serializer = StoreDiscoverySerializer(stores, many=True)
            return Response(serializer.data)
            
        except ValueError:
            return Response({"error": "Invalid coordinate format."}, status=400)
        
class StoreManagementViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Sellers to manage their own stores.
    """
    serializer_class = StoreManagementSerializer
    # Security: Must be logged in, must be a SELLER, and must OWN the store being accessed.
    permission_classes = [IsAuthenticated, IsSeller, IsStoreOwner]

    def get_queryset(self):
        # A seller should only ever see their own stores in the list view
        return Store.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # Hardcode the owner to the user making the request. 
        # Never trust the frontend to send the correct user ID.
        serializer.save(owner=self.request.user)