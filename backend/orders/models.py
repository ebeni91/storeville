import uuid
from django.db import models
from stores.models import Store, Product

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='orders')
    
    # Buyer Info
    buyer_name = models.CharField(max_length=100)
    buyer_phone = models.CharField(max_length=20)
    
    # 🔐 Tracking Info (New)
    # Short, readable ID for humans (e.g., "SV-A1B2")
    order_reference = models.CharField(max_length=20, unique=True, blank=True)
    # Long, secret token for API verification
    tracking_token = models.CharField(max_length=100, unique=True, blank=True)
    
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    # 💳 Selected payment method for this order
    PAYMENT_METHOD_CHOICES = (
        ('cod', 'Cash on Delivery'),
        ('chapa', 'Chapa'),
        ('telebirr', 'Telebirr'),
        ('mpesa', 'M-Pesa'),
    )
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cod')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.order_reference} - {self.buyer_name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2) 

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"