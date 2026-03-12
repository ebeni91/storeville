from rest_framework import viewsets, views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError as DjangoValidationError

from core.permissions import IsSeller
from apps.products.models import Product
from .models import Cart, CartItem, Order
from .serializers import (
    CartSerializer, CartItemSerializer, CheckoutSerializer, OrderSerializer
)
from .services import CheckoutService

class CartViewSet(viewsets.ViewSet):
    """
    API for Customers to manage their cart on a specific store's subdomain.
    """
    permission_classes = [IsAuthenticated]

    def get_cart(self, request):
        if not hasattr(request, 'store_context') or not request.store_context:
            return Response({"error": "Must be accessed from a store subdomain."}, status=status.HTTP_400_BAD_REQUEST)
        
        cart, _ = Cart.objects.get_or_create(user=request.user, store=request.store_context)
        return cart

    def list(self, request):
        cart = self.get_cart(request)
        if isinstance(cart, Response): return cart # Handle missing store context
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def create(self, request): # Add item to cart
        cart = self.get_cart(request)
        if isinstance(cart, Response): return cart

        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        product = get_object_or_404(Product, id=serializer.validated_data['product_id'], store=request.store_context)
        
        # Check if item exists, update quantity if it does
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, product=product,
            defaults={'quantity': serializer.validated_data.get('quantity', 1)}
        )
        
        if not created:
            cart_item.quantity += serializer.validated_data.get('quantity', 1)
            cart_item.save()

        return Response(CartSerializer(cart).data)


class CheckoutView(views.APIView):
    """
    Endpoint to convert the current store's Cart into an Order.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not hasattr(request, 'store_context') or not request.store_context:
            return Response({"error": "Must be accessed from a store subdomain."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # Call our robust service layer
            order = CheckoutService.process_checkout(
                user=request.user,
                store=request.store_context,
                delivery_method=serializer.validated_data['delivery_method'],
                delivery_address=serializer.validated_data.get('delivery_address')
            )
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
            
        except DjangoValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CustomerOrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Allows a customer to view their order history across all stores.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).order_by('-created_at')


class SellerOrderViewSet(viewsets.ModelViewSet):
    """
    Allows a seller to view and update the status of orders placed at their stores.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsSeller]

    def get_queryset(self):
        return Order.objects.filter(store__owner=self.request.user).order_by('-created_at')