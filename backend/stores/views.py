import re
from django.db.models import Q
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Store, Product
from .serializers import StoreSerializer, ProductSerializer

# ==========================================
# 1. HELPER FUNCTION (For Chatbot)
# ==========================================
def parse_search_query(query):
    """
    Extracts price constraints and cleans the search query.
    Returns: (cleaned_query, max_price)
    Example: "cheap laptop under 50000" -> ("laptop", 50000)
    """
    price_pattern = r'(?:under|less than|below|cheaper than)\s+(\d+)'
    match = re.search(price_pattern, query, re.IGNORECASE)
    
    max_price = None
    if match:
        max_price = float(match.group(1))
        query = re.sub(price_pattern, '', query, flags=re.IGNORECASE)
    
    query = re.sub(r'\b(i want|looking for|buy|need|a|an|the)\b', '', query, flags=re.IGNORECASE).strip()
    return query, max_price

# ==========================================
# 2. ORIGINAL VIEWSETS (Restored)
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
# 3. NEW CHATBOT SEARCH VIEW (The missing piece)
# ==========================================
class ChatProductSearchView(APIView):
    """
    AI-lite search that understands price limits and keywords.
    """
    def get(self, request):
        user_query = request.query_params.get('q', '')
        if not user_query:
            return Response([])

        keyword, max_price = parse_search_query(user_query)

        products = Product.objects.all()
        
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
        
        return Response({
            "response_text": f"I found {len(products)} items for '{keyword}'" + (f" under {max_price} ETB." if max_price else "."),
            "products": serializer.data
        })