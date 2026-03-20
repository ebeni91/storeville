from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction

from apps.stores.models import Store
from .models import Cart, CartItem, Order, OrderItem
from .serializers import (
    CartSerializer, 
    CartItemSerializer, 
    OrderSerializer, 
    CheckoutSerializer
)

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

class CheckoutView(APIView):
    # Enforces the Auth check as requested
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        store = get_object_or_404(Store, id=data['store_id'])
        items_data = data.get('items', [])

        if not items_data:
            return Response({"error": "Cart payload is empty."}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate the total from the frontend payload
        total_amount = sum(item['price'] * item['quantity'] for item in items_data)

        # Create the Order
        order = Order.objects.create(
            store=store,
            customer=request.user,
            customer_name=data['customer_name'],
            contact_phone=data['contact_phone'],
            delivery_address=data.get('delivery_address', ''),
            delivery_method=data['delivery_method'],
            payment_method=data['payment_method'],
            delivery_latitude=data.get('delivery_latitude'),
            delivery_longitude=data.get('delivery_longitude'),
            total_amount=total_amount,
            status='PENDING'
        )

        # Move items into the order
        for item in items_data:
            OrderItem.objects.create(
                order=order,
                product_name=item['name'],
                price=item['price'],
                quantity=item['quantity']
            )

        result_serializer = OrderSerializer(order)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)

class CustomerOrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).order_by('-created_at')

class SellerOrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Sellers only see orders for the stores they own
        return Order.objects.filter(store__owner=self.request.user).order_by('-created_at')