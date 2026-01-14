from django.db.models import Q
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Store, Product
from .serializers import StoreSerializer, ProductSerializer
from .utils import parse_search_query # 👈 Now correctly importing from utils

# ==========================================
# 1. STORE VIEWSET
# ==========================================
class StoreViewSet(viewsets.ModelViewSet): 
    serializer_class = StoreSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Store.objects.filter(is_active=True)

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
    """
    AI-lite search that understands price limits, categories, and keywords.
    """
    def get(self, request):
        user_query = request.query_params.get('q', '')
        if not user_query:
            return Response([])

        # 1. Parse intent (Now returns 3 values)
        keyword, max_price, category = parse_search_query(user_query)

        products = Product.objects.all()
        
        # 2. Filter by Category (if detected)
        if category:
            products = products.filter(store__category=category)

        # 3. Filter by Keyword (if any remains)
        if keyword:
            products = products.filter(
                Q(name__icontains=keyword) | 
                Q(description__icontains=keyword) |
                Q(store__name__icontains=keyword)
            )
        
        # 4. Filter by Price
        if max_price:
            products = products.filter(price__lte=max_price)

        # 5. Sort & Limit
        if 'cheap' in user_query.lower():
            products = products.order_by('price')[:5]
        else:
            products = products[:5]

        serializer = ProductSerializer(products, many=True, context={'request': request})
        
        # 6. Build a smart response text
        msg = f"I found {len(products)} "
        if category:
            msg += f"{category} "
        msg += "items"
        
        if keyword:
            msg += f" matching '{keyword}'"
        
        if max_price:
            msg += f" under {max_price} ETB"
        
        msg += "."

        if len(products) == 0:
             msg = "I couldn't find any products matching that criteria. Try browsing our categories directly!"

        return Response({
            "response_text": msg,
            "products": serializer.data
        })