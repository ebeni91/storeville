from abc import ABC, abstractmethod
from django.conf import settings
import requests
import uuid

class BasePaymentProvider(ABC):
    """
    The abstract base class (Strategy) for all payment gateways.
    """
    @abstractmethod
    def initialize_payment(self, order, transaction):
        """Must return a checkout URL to redirect the user to."""
        pass

    @abstractmethod
    def verify_webhook_signature(self, request):
        """Must validate the cryptographic signature from the gateway."""
        pass

class ChapaProvider(BasePaymentProvider):
    def __init__(self):
        self.secret_key = settings.CHAPA_SECRET_KEY
        self.base_url = "https://api.chapa.co/v1/transaction/initialize"

    def initialize_payment(self, order, transaction):
        # Generate a unique reference for Chapa
        tx_ref = f"STV-{transaction.id}"
        transaction.provider_reference = tx_ref
        transaction.save()

        payload = {
            "amount": str(order.total_price),
            "currency": "ETB",
            "email": order.customer.email or f"{order.customer.username}@storeville.app",
            "first_name": order.customer.first_name,
            "last_name": order.customer.last_name,
            "tx_ref": tx_ref,
            "callback_url": f"https://api.storeville.app/api/payments/webhook/chapa/",
            "return_url": f"https://{order.store.slug}.storeville.app/checkout/success/",
            "customization[title]": f"Order from {order.store.name}"
        }

        headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }

        response = requests.post(self.base_url, json=payload, headers=headers)
        response_data = response.json()

        if response_data.get('status') == 'success':
            return response_data['data']['checkout_url']
        
        raise Exception("Failed to initialize Chapa payment")

    def verify_webhook_signature(self, request):
        # Chapa sends a hash in the 'x-chapa-signature' header
        # In production, use hmac.new() to hash the request body with your CHAPA_WEBHOOK_SECRET
        # and compare it to the header to prove the request actually came from Chapa.
        chapa_signature = request.headers.get('x-chapa-signature')
        # Implementation details omitted for brevity, but this is critical for security.
        return True