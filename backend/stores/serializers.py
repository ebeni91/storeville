from rest_framework import serializers
from .models import Store, Product

class ProductSerializer(serializers.ModelSerializer):
    store_slug = serializers.CharField(source='store.slug', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'stock', 
            'is_available', 'image', 'created_at', 
            'store', 'store_slug', 'store_name' 
        ]
        read_only_fields = ['store'] 

class StoreSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)
    
    # 📍 Distance field (calculated on the fly)
    distance = serializers.FloatField(read_only=True, required=False)
    payment_methods = serializers.ListField(child=serializers.CharField(), required=False)
    payment_accounts = serializers.DictField(child=serializers.CharField(), required=False)

    class Meta:
        model = Store
        fields = [
            'id', 'name', 'slug', 'category', 'primary_color', 
            'latitude', 'longitude', 'address', 'distance', # 👈 Added fields
            'products', 'owner', 'created_at', 'is_active',
            'payment_methods', 'payment_accounts'
        ]
        read_only_fields = ['owner', 'slug', 'products', 'distance']

    def validate(self, data):
        methods = data.get('payment_methods', []) or []
        accounts = data.get('payment_accounts', {}) or {}
        for m in methods:
            if m not in ['chapa','telebirr','mpesa']:
                raise serializers.ValidationError({'payment_methods': f'Unsupported method: {m}'})
            if not accounts.get(m):
                raise serializers.ValidationError({ 'payment_accounts': f'Account/phone required for {m}' })
        return data