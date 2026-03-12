from django.db.models import F, ExpressionWrapper, FloatField
from django.db.models.functions import ACos, Cos, Radians, Sin
from .models import Store

class LocationService:
    @staticmethod
    def get_nearby_stores(user_lat, user_lon, radius_km=10.0, category=None):
        """
        Returns active stores within a specific radius using the Haversine formula,
        executed entirely at the database level for maximum performance.
        """
        # Earth's radius in kilometers
        earth_radius = 6371.0 

        # Convert user coordinates to floats
        lat = float(user_lat)
        lon = float(user_lon)

        # Build the Haversine formula using Django ORM functions
        distance_expr = ExpressionWrapper(
            earth_radius * ACos(
                Cos(Radians(lat)) * Cos(Radians(F('latitude'))) *
                Cos(Radians(F('longitude')) - Radians(lon)) +
                Sin(Radians(lat)) * Sin(Radians(F('latitude')))
            ),
            output_field=FloatField()
        )

        # Query active stores, annotate with calculated distance, and filter by radius
        queryset = Store.objects.filter(is_active=True).annotate(
            distance=distance_expr
        ).filter(distance__lte=radius_km).order_by('distance')

        if category:
            queryset = queryset.filter(category__iexact=category)

        return queryset