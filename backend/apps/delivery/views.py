from rest_framework import viewsets, views, mixins, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from core.permissions import IsDriver
from .models import Delivery, Driver
from .serializers import DeliverySerializer, DriverLocationSerializer

class DriverActionViewSet(viewsets.ModelViewSet):
    """
    API for drivers to view their assigned deliveries and update statuses.
    """
    serializer_class = DeliverySerializer
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def get_queryset(self):
        # A driver can only see deliveries assigned to them
        return Delivery.objects.filter(driver__user=self.request.user).order_by('-created_at')

    def update(self, request, *args, **kwargs):
        """
        Drivers use this to update the delivery status (e.g., to DELIVERED)
        """
        delivery = self.get_object()
        new_status = request.data.get('status')

        if new_status in dict(Delivery.Status.choices):
            delivery.status = new_status
            if new_status == Delivery.Status.DELIVERED:
                delivery.delivered_at = timezone.now()
                # Mark driver as available again
                driver = delivery.driver
                driver.is_available = True
                driver.save()
            
            delivery.save()
            return Response(self.get_serializer(delivery).data)
        
        return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

class DriverLocationUpdateView(views.APIView):
    """
    Endpoint hit by the driver's phone app every 10 seconds to update GPS coordinates.
    """
    permission_classes = [permissions.IsAuthenticated, IsDriver]

    def patch(self, request):
        driver = get_object_or_404(Driver, user=request.user)
        serializer = DriverLocationSerializer(driver, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PublicTrackingView(views.APIView):
    """
    Public endpoint for customers to track their order via the tracking code.
    No auth required, just the tracking string.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, tracking_code):
        delivery = get_object_or_404(Delivery, tracking_code=tracking_code)
        serializer = DeliverySerializer(delivery)
        return Response(serializer.data)