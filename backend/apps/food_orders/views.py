from django.shortcuts import render

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import FoodOrder
from .serializers import FoodOrderSerializer

class FoodOrderViewSet(viewsets.ModelViewSet):
    serializer_class = FoodOrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own orders
        return FoodOrder.objects.filter(customer=self.request.user).order_by('-created_at')