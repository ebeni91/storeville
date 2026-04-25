import math
from django.db.models import F, ExpressionWrapper, FloatField
from django.db.models.functions import ACos, Cos, Radians, Sin
from .models import Store

class LocationService:
    @staticmethod
    def get_nearby_stores(user_lat, user_lon, radius_km=10.0, store_type=None):
        """
        Find stores within radius_km of the given coordinates.

        ✅ PERFORMANCE FIX: Apply a lat/lon bounding box BEFORE the expensive
        Haversine annotation. The trig functions (ACos, Cos, Sin) previously ran
        against the ENTIRE Store table on every map request — O(N) CPU cost.
        The bounding box is a simple range filter that uses column indexes and
        reduces the candidate set to a small geographic area, typically cutting
        CPU cost by 90-99% at scale.

        The bounding box is a square approximation (slightly larger than the
        exact circle) so no valid stores near the edge are excluded before the
        precise Haversine filter is applied.
        """
        earth_radius = 6371.0
        lat = float(user_lat)
        lon = float(user_lon)

        # 1. Cheap bounding box filter (uses index on latitude/longitude columns)
        #    1 degree latitude ≈ 111 km everywhere.
        #    1 degree longitude ≈ 111 km * cos(lat) (shrinks toward poles).
        delta_lat = radius_km / 111.0
        delta_lon = radius_km / (111.0 * math.cos(math.radians(lat))) if math.cos(math.radians(lat)) != 0 else 180.0

        # 2. Expensive Haversine annotation — now only runs on the bounding box subset.
        distance_expr = ExpressionWrapper(
            earth_radius * ACos(
                Cos(Radians(lat)) * Cos(Radians(F('latitude'))) *
                Cos(Radians(F('longitude')) - Radians(lon)) +
                Sin(Radians(lat)) * Sin(Radians(F('latitude')))
            ),
            output_field=FloatField()
        )

        queryset = Store.objects.filter(
            is_active=True,
            latitude__isnull=False,
            longitude__isnull=False,
            latitude__range=(lat - delta_lat, lat + delta_lat),
            longitude__range=(lon - delta_lon, lon + delta_lon),
        ).annotate(
            distance=distance_expr
        ).filter(distance__lte=radius_km).order_by('distance')

        if store_type:
            queryset = queryset.filter(store_type=store_type.upper())

        return queryset