from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    # In a real app, we would restrict this to only allow creating orders, 
    # not viewing all of them unless you are the admin.