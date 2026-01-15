from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Order.objects.filter(store__owner=user).order_by('-created_at')
        return Order.objects.none()

    def perform_create(self, serializer):
        serializer.save()

# 👇 New View for Chatbot Lookup
class OrderStatusView(APIView):
    permission_classes = [permissions.AllowAny] # Guests can check if they have the ref code

    def get(self, request):
        ref = request.query_params.get('ref', '').strip()
        if not ref:
            return Response({"error": "Please provide an Order Reference (e.g., SV-X1Y2Z3)"}, status=400)
        
        try:
            # Case-insensitive match for the reference
            order = Order.objects.get(order_reference__iexact=ref)
            
            return Response({
                "found": True,
                "reference": order.order_reference,
                "status": order.status,
                "buyer": order.buyer_name,
                "total": order.total_amount,
                "date": order.created_at.strftime("%Y-%m-%d"),
                "items_count": order.items.count()
            })
        except Order.DoesNotExist:
            return Response({
                "found": False,
                "message": "Order not found. Please check the reference code."
            }, status=404)