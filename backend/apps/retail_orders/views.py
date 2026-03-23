from django.shortcuts import render

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import RetailOrder
from .serializers import RetailOrderSerializer

class RetailOrderViewSet(viewsets.ModelViewSet):
    serializer_class = RetailOrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own orders
        return RetailOrder.objects.filter(customer=self.request.user).order_by('-created_at')