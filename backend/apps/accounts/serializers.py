from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.db import transaction
import uuid
from apps.stores.models import Store
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.state import token_backend

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role']
        read_only_fields = ['id', 'role']

# 1. Serializer for the nested store data (Now includes store_name and description)
class StoreRegistrationSerializer(serializers.Serializer):
    store_name = serializers.CharField(max_length=255)
    description = serializers.CharField(allow_blank=True, required=False)
    category = serializers.CharField(max_length=50)
    business_type = serializers.CharField(max_length=100)
    store_type = serializers.CharField(max_length=50)
    latitude = serializers.FloatField()  # Changed to FloatField
    longitude = serializers.FloatField() # Changed to FloatField
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=[User.Role.CUSTOMER, User.Role.SELLER])
    name = serializers.CharField(write_only=True, required=False) 
    
    # CRITICAL FIX: Added write_only=True so DRF doesn't look for it on the output
    store_data = StoreRegistrationSerializer(required=False, write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'phone_number', 'role', 'name', 'store_data']

    @transaction.atomic 
    def create(self, validated_data):
        store_data = validated_data.pop('store_data', None)
        name = validated_data.pop('name', '')
        email = validated_data.get('email', '')
        phone = validated_data.get('phone_number', '')
        
        base_username = email.split('@')[0] if email else phone
        username = f"{base_username}_{uuid.uuid4().hex[:6]}"
        
        name_parts = name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            phone_number=phone,
            role=validated_data['role'],
            first_name=first_name,
            last_name=last_name
        )

        if user.role == User.Role.SELLER and store_data:
            store_name = store_data.get('store_name')
            base_slug = slugify(store_name)
            
            slug = base_slug
            counter = 1
            while Store.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            Store.objects.create(
                owner=user,
                name=store_name,
                slug=slug,
                category=store_data['category'],
                description=store_data.get('description', ''),
                store_type=store_data['store_type'],
                latitude=round(store_data['latitude'], 6),
                longitude=round(store_data['longitude'], 6)
            )

        return user
    


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove the default 'username' field requirement
        if 'username' in self.fields:
            del self.fields['username']
        
        # Accept either email or phone
        self.fields['email'] = serializers.EmailField(required=False)
        self.fields['phone_number'] = serializers.CharField(required=False)

    def validate(self, attrs):
        password = attrs.get('password')
        email = attrs.get('email')
        phone_number = attrs.get('phone_number')

        user = None

        # Look up the user by whichever method they chose
        if email:
            user = User.objects.filter(email=email).first()
        elif phone_number:
            user = User.objects.filter(phone_number=phone_number).first()

        # Check if user exists and password matches
        if user and user.check_password(password):
            if not user.is_active:
                raise AuthenticationFailed('This account is inactive.', code='user_inactive')
            
            # Generate the tokens
            refresh = self.get_token(user)

            # Return the exact payload the Next.js frontend expects
            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'phone_number': user.phone_number,
                    'role': user.role,
                    'first_name': getattr(user, 'first_name', ''),
                    'last_name': getattr(user, 'last_name', ''),
                }
            }
        
        raise AuthenticationFailed('Invalid email/phone or password.')
    
class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Decode the refresh token to identify the user
        decoded_payload = token_backend.decode(attrs['refresh'], verify=True)
        user_id = decoded_payload.get('user_id')
        
        try:
            user = User.objects.get(id=user_id)
            # Inject the exact payload the Next.js frontend expects
            data['user'] = {
                'id': str(user.id),
                'email': user.email,
                'phone_number': user.phone_number,
                'role': user.role,
                'first_name': getattr(user, 'first_name', ''),
                'last_name': getattr(user, 'last_name', ''),
            }
        except User.DoesNotExist:
            pass
            
        return data

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