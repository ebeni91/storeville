from django.shortcuts import render

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import FoodOrder
from .serializers import FoodOrderSerializer

class FoodOrderViewSet(viewsets.ModelViewSet):
    serializer_class = FoodOrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SELLER':
            return FoodOrder.objects.filter(store__owner=user).order_by('-created_at')
        return FoodOrder.objects.filter(customer=user).order_by('-created_at')