from rest_framework import serializers
from .models import PaymentTransaction

class PaymentTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTransaction
        fields = ['id', 'order', 'provider', 'provider_reference', 'amount', 'status', 'created_at']
        read_only_fields = fields

class PaymentInitializationSerializer(serializers.Serializer):
    order_id = serializers.UUIDField()
    provider = serializers.ChoiceField(choices=PaymentTransaction.Provider.choices)