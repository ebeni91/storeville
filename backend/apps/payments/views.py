from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction

from apps.orders.models import Order
from .models import PaymentTransaction
from .serializers import PaymentInitializationSerializer
from .providers import ChapaProvider

class InitializePaymentView(views.APIView):
    """
    Called by the frontend to generate a payment link for a specific order.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PaymentInitializationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        order_id = serializer.validated_data['order_id']
        provider_choice = serializer.validated_data['provider']

        # Ensure the user actually owns this order and it hasn't been paid yet
        order = get_object_or_404(Order, id=order_id, customer=request.user)
        
        if order.payment_status == Order.PaymentStatus.PAID:
            return Response({"error": "This order is already paid."}, status=status.HTTP_400_BAD_REQUEST)

        # Create a pending transaction record
        payment_tx = PaymentTransaction.objects.create(
            order=order,
            provider=provider_choice,
            amount=order.total_price,
            status=PaymentTransaction.Status.PENDING
        )

        try:
            checkout_url = None
            if provider_choice == PaymentTransaction.Provider.CHAPA:
                provider = ChapaProvider()
                checkout_url = provider.initialize_payment(order, payment_tx)
            # elif provider_choice == 'TELEBIRR':
            #     provider = TelebirrProvider()
            #     checkout_url = provider.initialize_payment(order, payment_tx)
            
            if checkout_url:
                return Response({"checkout_url": checkout_url}, status=status.HTTP_200_OK)
            else:
                raise Exception("Provider returned empty URL")

        except Exception as e:
            # If the gateway fails, mark the transaction as failed
            payment_tx.status = PaymentTransaction.Status.FAILED
            payment_tx.save()
            return Response({"error": f"Payment gateway error: {str(e)}"}, status=status.HTTP_502_BAD_GATEWAY)


class ChapaWebhookView(views.APIView):
    """
    Publicly accessible endpoint that Chapa hits to confirm payment success.
    """
    permission_classes = [permissions.AllowAny] # No JWT required for webhooks

    @transaction.atomic
    def post(self, request):
        provider = ChapaProvider()
        
        # 1. SECURITY: Verify cryptographic signature (implemented in provider)
        if not provider.verify_webhook_signature(request):
            return Response({"error": "Invalid signature"}, status=status.HTTP_403_FORBIDDEN)

        payload = request.data
        tx_ref = payload.get('tx_ref')
        tx_status = payload.get('status')

        try:
            # 2. Find the exact pending transaction
            payment_tx = PaymentTransaction.objects.get(
                provider_reference=tx_ref, 
                status=PaymentTransaction.Status.PENDING
            )
            
            payment_tx.webhook_payload = payload

            # 3. Process the result securely
            if tx_status == 'success':
                payment_tx.status = PaymentTransaction.Status.SUCCESS
                payment_tx.save()

                order = payment_tx.order
                order.payment_status = Order.PaymentStatus.PAID
                
                # Auto-advance the order status based on delivery type
                if order.delivery_method in [Order.DeliveryMethod.DELIVERY_ASAP, Order.DeliveryMethod.PICKUP]:
                    order.status = Order.Status.PREPARING
                else:
                    order.status = Order.Status.CONFIRMED
                order.save()
            else:
                payment_tx.status = PaymentTransaction.Status.FAILED
                payment_tx.save()

        except PaymentTransaction.DoesNotExist:
            pass # Ignore duplicate or unknown webhooks

        # Always return 200 OK so the provider stops retrying the webhook
        return Response(status=status.HTTP_200_OK)