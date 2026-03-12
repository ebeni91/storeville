import uuid
from django.db import models
from apps.orders.models import Order

class PaymentTransaction(models.Model):
    class Provider(models.TextChoices):
        CHAPA = 'CHAPA', 'Chapa'
        TELEBIRR = 'TELEBIRR', 'Telebirr'
        ARIFPAY = 'ARIFPAY', 'ArifPay'
        SANTIMPAY = 'SANTIMPAY', 'SantimPay'
        COD = 'COD', 'Cash on Delivery'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SUCCESS = 'SUCCESS', 'Success'
        FAILED = 'FAILED', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name='transactions')
    
    provider = models.CharField(max_length=20, choices=Provider.choices)
    provider_reference = models.CharField(max_length=255, unique=True, null=True, blank=True)
    
    amount = models.DecimalField(max_digits=11, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    # Store the raw webhook payload for auditing/debugging
    webhook_payload = models.JSONField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.provider} - {self.order.id} - {self.status}"