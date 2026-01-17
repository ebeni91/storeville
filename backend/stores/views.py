import math
from django.db.models import Q
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Store, Product
from .serializers import StoreSerializer, ProductSerializer
from .utils import parse_search_query

# ==========================================
# 1. STORE VIEWSET (With Location Logic)
# ==========================================
class StoreViewSet(viewsets.ModelViewSet): 
    serializer_class = StoreSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Store.objects.filter(is_active=True)
        
        # 📍 GEOLOCATION LOGIC
        user_lat = self.request.query_params.get('lat')
        user_lng = self.request.query_params.get('lng')
        radius = self.request.query_params.get('radius', 50) # Default search radius: 50km

        if user_lat and user_lng:
            try:
                lat = float(user_lat)
                lng = float(user_lng)
                radius_val = float(radius)
                
                nearby_stores = []
                for store in queryset:
                    # Skip stores without location
                    if store.latitude and store.longitude:
                        dist = self.calculate_distance(lat, lng, store.latitude, store.longitude)
                        if dist <= radius_val:
                            # Attach distance to object so serializer sees it
                            store.distance = round(dist, 1) 
                            nearby_stores.append(store)
                
                # Sort by nearest first
                nearby_stores.sort(key=lambda x: x.distance)
                return nearby_stores

            except ValueError:
                pass # If params are invalid, return standard list

        return queryset

    # Helper: Haversine Formula (Calculate distance between two points)
    def calculate_distance(self, lat1, lon1, lat2, lon2):
        R = 6371  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2) * math.sin(dlat / 2) + \
            math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
            math.sin(dlon / 2) * math.sin(dlon / 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'])
    def mine(self, request):
        store = Store.objects.filter(owner=request.user).first()
        if store:
            serializer = self.get_serializer(store)
            return Response(serializer.data)
        return Response({}) 

# ==========================================
# 2. PRODUCT VIEWSET
# ==========================================
class ProductViewSet(viewsets.ModelViewSet): 
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Product.objects.filter(is_available=True)
        
    def perform_create(self, serializer):
        store = Store.objects.filter(owner=self.request.user).first()
        if store:
            serializer.save(store=store)
        else:
            raise Exception("You must have a store to add products")

# ==========================================
# 3. SMART CHATBOT SEARCH VIEW
# ==========================================
class ChatProductSearchView(APIView):
    def get(self, request):
        user_query = request.query_params.get('q', '')
        if not user_query:
            return Response([])

        keyword, max_price, category = parse_search_query(user_query)

        products = Product.objects.all()
        
        if category:
            products = products.filter(store__category=category)

        if keyword:
            products = products.filter(
                Q(name__icontains=keyword) | 
                Q(description__icontains=keyword) |
                Q(store__name__icontains=keyword)
            )
        
        if max_price:
            products = products.filter(price__lte=max_price)

        if 'cheap' in user_query.lower():
            products = products.order_by('price')[:5]
        else:
            products = products[:5]

        serializer = ProductSerializer(products, many=True, context={'request': request})
        
        msg = f"I found {len(products)} "
        if category: msg += f"{category} "
        msg += "items"
        if keyword: msg += f" matching '{keyword}'"
        if max_price: msg += f" under {max_price} ETB"
        msg += "."

        if len(products) == 0:
             msg = "I couldn't find any products matching that criteria."

        return Response({
            "response_text": msg,
            "products": serializer.data
        })