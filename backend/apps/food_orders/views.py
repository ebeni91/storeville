from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db import transaction

from .models import FoodOrder, Cart, CartItem
from .serializers import FoodOrderSerializer
from apps.food_menu.models import MenuItem
from apps.stores.models import Store

class FoodOrderViewSet(viewsets.ModelViewSet):
    serializer_class = FoodOrderSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        """
        ✅ SECURITY FIX (Issue #4): Lock down write actions by role.
        Mirrors RetailOrderViewSet.get_permissions().
        Sellers can update order status; only admins can delete order records.
        """
        if self.action == 'destroy':
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SELLER':
            return FoodOrder.objects.filter(store__owner=user).order_by('-created_at')
        return FoodOrder.objects.filter(customer=user).order_by('-created_at')

    @action(detail=False, methods=['get'])
    def track(self, request):
        order_id = request.query_params.get('id', '').replace('ORD-', '').strip()
        if not order_id:
            return Response({"error": "No ID provided"}, status=400)
        
        qs = self.get_queryset().filter(id__istartswith=order_id)
        order = qs.first()
        if not order:
            return Response({"error": "Order not found"}, status=404)
            
        serializer = self.get_serializer(order)
        return Response(serializer.data)

class CartMergeView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        store_id = request.data.get('store_id')
        guest_items = request.data.get('items', []) 

        if not store_id:
            return Response({"error": "store_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            store = Store.objects.get(id=store_id)
        except Store.DoesNotExist:
            return Response({"error": "Store not found"}, status=status.HTTP_404_NOT_FOUND)

        # 1. Get or create the official database cart for this user at this restaurant
        cart, created = Cart.objects.get_or_create(user=request.user, store=store)

        # 2. Loop through the guest items and merge them
        for item in guest_items:
            # The frontend sends 'product_id', which translates to 'menu_item_id' here
            menu_item_id = item.get('product_id')
            quantity = int(item.get('quantity', 1))

            try:
                # Ensure the dish actually belongs to this restaurant
                menu_item = MenuItem.objects.get(id=menu_item_id, store=store)
                
                # Check if item is already in the DB cart
                cart_item, item_created = CartItem.objects.get_or_create(
                    cart=cart, 
                    menu_item=menu_item,
                    defaults={'quantity': quantity}
                )

                # If it already existed, COMBINE the quantities
                if not item_created:
                    cart_item.quantity += quantity
                    cart_item.save()

            except MenuItem.DoesNotExist:
                continue # Skip invalid items quietly

        return Response({"message": "Food cart merged successfully"}, status=status.HTTP_200_OK)



class CartDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        store_id = request.query_params.get('store_id')
        if not store_id:
            return Response({"error": "store_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ PERFORMANCE FIX (Issue #19): prefetch_related eliminates N+1 queries.
        # Without this, each cart item triggers a separate DB query for menu_item.
        cart = Cart.objects.filter(
            user=request.user, store_id=store_id
        ).prefetch_related('items__menu_item').first()

        if not cart:
            return Response({"items": []}, status=status.HTTP_200_OK)

        # Format the items for the Next.js checkout UI
        formatted_items = []
        for item in cart.items.all():
            # Handle the difference between Retail (product) and Food (menu_item)
            product_obj = getattr(item, 'product', None) or getattr(item, 'menu_item', None)
            
            if product_obj:
                formatted_items.append({
                    "id": str(product_obj.id),
                    "name": product_obj.name,
                    "price": str(product_obj.price),
                    "quantity": item.quantity,
                    "image": request.build_absolute_uri(product_obj.image.url) if product_obj.image else None,
                })

        return Response({"items": formatted_items}, status=status.HTTP_200_OK)
        
    def delete(self, request, *args, **kwargs):
        # We will call this right after a successful payment to empty the cart!
        store_id = request.query_params.get('store_id')
        Cart.objects.filter(user=request.user, store_id=store_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)