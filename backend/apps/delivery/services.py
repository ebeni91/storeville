from django.db import transaction
from django.db.models import F, ExpressionWrapper, FloatField
from django.db.models.functions import ACos, Cos, Radians, Sin
from apps.orders.models import Order
from .models import Delivery, Driver

class DeliveryService:
    @staticmethod
    @transaction.atomic
    def initiate_delivery(order):
        """
        Creates a delivery record and attempts to find the nearest available driver.
        """
        if order.delivery_method in [Order.DeliveryMethod.PICKUP]:
            raise ValueError("This order is marked for customer pickup.")

        # Create the initial delivery record
        delivery = Delivery.objects.create(
            order=order,
            pickup_latitude=order.store.latitude,
            pickup_longitude=order.store.longitude,
            status=Delivery.Status.SEARCHING
        )

        # In a real system, you'd trigger a Celery task here to ping drivers asynchronously.
        # For the prototype, we will auto-assign the nearest available driver immediately.
        nearest_driver = DeliveryService._find_nearest_available_driver(
            lat=order.store.latitude, 
            lon=order.store.longitude
        )

        if nearest_driver:
            delivery.driver = nearest_driver
            delivery.status = Delivery.Status.ASSIGNED
            delivery.save()
            
            # Mark driver as unavailable so they don't get double-booked
            nearest_driver.is_available = False
            nearest_driver.save()

            # Update core order status
            order.status = Order.Status.OUT_FOR_DELIVERY
            order.save()

        return delivery

    @staticmethod
    def _find_nearest_available_driver(lat, lon, radius_km=5.0):
        """
        Uses the database Haversine formula to find the closest online driver.
        """
        earth_radius = 6371.0 
        lat = float(lat)
        lon = float(lon)

        distance_expr = ExpressionWrapper(
            earth_radius * ACos(
                Cos(Radians(lat)) * Cos(Radians(F('current_latitude'))) *
                Cos(Radians(F('current_longitude')) - Radians(lon)) +
                Sin(Radians(lat)) * Sin(Radians(F('current_latitude')))
            ),
            output_field=FloatField()
        )

        # Find available drivers, calculate distance, sort by closest
        nearest = Driver.objects.filter(is_available=True).annotate(
            distance=distance_expr
        ).filter(distance__lte=radius_km).order_by('distance').first()

        return nearest