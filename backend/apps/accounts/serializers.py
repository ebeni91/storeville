from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role']
        read_only_fields = ['id', 'role']



from .models import CustomerAddress, SavedPaymentMethod

class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = ['id', 'title', 'address_text', 'is_primary', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        user = self.context['request'].user
        return CustomerAddress.objects.create(user=user, **validated_data)

class SavedPaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedPaymentMethod
        fields = ['id', 'provider', 'account_identifier', 'is_default', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        return SavedPaymentMethod.objects.create(user=user, **validated_data)