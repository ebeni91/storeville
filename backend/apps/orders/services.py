from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Cart, Order, OrderItem
from apps.products.models import Product

class CheckoutService:
    @staticmethod
    @transaction.atomic
    def process_checkout(user, store, delivery_method, delivery_address=None):
        """
        Safely converts a user's active cart for a specific store into a confirmed Order.
        Uses database transactions to ensure data integrity.
        """
        # 1. Fetch the user's cart for this specific store
        try:
            cart = Cart.objects.prefetch_related('items__product').get(user=user, store=store)
        except Cart.DoesNotExist:
            raise ValidationError("No active cart found for this store.")

        if not cart.items.exists():
            raise ValidationError("Cart is empty.")

        # 2. Create the base Order record
        order = Order.objects.create(
            customer=user,
            store=store,
            delivery_method=delivery_method,
            delivery_address=delivery_address,
            status=Order.Status.PENDING,
            payment_status=Order.PaymentStatus.PENDING
        )

        total_price = 0

        # 3. Move CartItems to OrderItems and deduct stock safely
        # Note: In a highly concurrent environment, we would use select_for_update() here
        for cart_item in cart.items.all():
            product = cart_item.product
            
            if product.stock < cart_item.quantity:
                raise ValidationError(f"Insufficient stock for {product.name}.")

            # Deduct stock
            product.stock -= cart_item.quantity
            product.save()

            # Snapshot the price
            line_item_price = product.price * cart_item.quantity
            total_price += line_item_price

            # Create immutable order item
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=cart_item.quantity,
                price_at_checkout=product.price
            )

        # 4. Finalize the order total and save
        order.total_price = total_price
        order.save()

        # 5. Clear the user's cart now that checkout is successful
        cart.delete()

        return order