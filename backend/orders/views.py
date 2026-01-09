from rest_framework import viewsets, permissions
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_permissions(self):
        # 🔓 Allow ANYONE (Guests) to Create an Order (Checkout)
        if self.action == 'create':
            return [permissions.AllowAny()]
        # 🔒 Require LOGIN for everything else (Dashboard/Viewing)
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        # 🔒 SECURITY: Only show orders belonging to the logged-in user's store
        user = self.request.user
        if user.is_authenticated:
            return Order.objects.filter(store__owner=user).order_by('-created_at')
        return Order.objects.none() # Return nothing if not logged in

    def perform_create(self, serializer):
        serializer.save()