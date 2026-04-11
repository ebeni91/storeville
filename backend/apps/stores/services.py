from django.db.models import F, ExpressionWrapper, FloatField
from django.db.models.functions import ACos, Cos, Radians, Sin
from .models import Store

class LocationService:
    @staticmethod
    def get_nearby_stores(user_lat, user_lon, radius_km=10.0, store_type=None):
        earth_radius = 6371.0 

        lat = float(user_lat)
        lon = float(user_lon)

        distance_expr = ExpressionWrapper(
            earth_radius * ACos(
                Cos(Radians(lat)) * Cos(Radians(F('latitude'))) *
                Cos(Radians(F('longitude')) - Radians(lon)) +
                Sin(Radians(lat)) * Sin(Radians(F('latitude')))
            ),
            output_field=FloatField()
        )

        queryset = Store.objects.filter(is_active=True).annotate(
            distance=distance_expr
        ).filter(distance__lte=radius_km).order_by('distance')

        # 🌟 FILTER BY STORE TYPE (Case-Insensitive)
        if store_type:
            queryset = queryset.filter(store_type=store_type.upper())

        return queryset