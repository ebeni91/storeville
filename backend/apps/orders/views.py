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
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        # 1. Validate the incoming checkout data (GPS, Delivery Method, etc.)
        serializer = CheckoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        store = get_object_or_404(Store, id=data['store_id'])

        # 2. Find the user's active cart for this specific store
        try:
            cart = Cart.objects.get(user=request.user, store=store)
        except Cart.DoesNotExist:
            return Response({"error": "No active cart found for this store."}, status=status.HTTP_404_NOT_FOUND)

        cart_items = cart.items.all()
        if not cart_items.exists():
            return Response({"error": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Calculate the total order amount
        total_amount = sum(item.product.price * item.quantity for item in cart_items)

        # 4. Create the Order (Super App Aware)
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

        # 5. Move items from the Cart to the Order
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product_name=item.product.name,
                price=item.product.price,
                quantity=item.quantity
            )

        # 6. Destroy the cart now that the order is placed!
        cart.delete()

        # 7. Return the completed order back to Next.js
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