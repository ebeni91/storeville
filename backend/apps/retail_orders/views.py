from django.shortcuts import render

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import RetailOrder
from .serializers import RetailOrderSerializer

class RetailOrderViewSet(viewsets.ModelViewSet):
    serializer_class = RetailOrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SELLER':
            return RetailOrder.objects.filter(store__owner=user).order_by('-created_at')
        return RetailOrder.objects.filter(customer=user).order_by('-created_at')