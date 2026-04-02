import json
from datetime import timedelta
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from apps.accounts.models import User
from apps.stores.models import Store
from apps.retail_orders.models import RetailOrder, RetailOrderItem
from apps.food_orders.models import FoodOrder
from apps.payments.models import PaymentTransaction
from apps.retail_catalog.models import RetailProduct


def dashboard_callback(request, context):
    """
    STOREVILLE Premium Dashboard Callback
    Injects live KPI metrics, 7-day order charts, and trending products
    into the Unfold admin homepage context.
    """
    now = timezone.now()
    today = now.date()
    seven_days_ago = today - timedelta(days=6)

    # ─── KPI CARDS ────────────────────────────────────────────────────────────
    total_buyers  = User.objects.filter(role='BUYER').count()
    total_sellers = User.objects.filter(role='SELLER').count()
    total_users   = User.objects.count()
    total_stores  = Store.objects.count()

    retail_pending = RetailOrder.objects.filter(status='PENDING').count()
    food_pending   = FoodOrder.objects.filter(status='PENDING').count()
    total_pending  = retail_pending + food_pending

    lifetime_earnings = (
        PaymentTransaction.objects.filter(status='SUCCESS')
        .aggregate(total=Sum('amount'))['total'] or 0
    )

    # This week vs last week revenue
    this_week_start = today - timedelta(days=6)
    last_week_start = today - timedelta(days=13)
    last_week_end   = today - timedelta(days=7)

    this_week_rev = (
        PaymentTransaction.objects
        .filter(status='SUCCESS', created_at__date__gte=this_week_start)
        .aggregate(total=Sum('amount'))['total'] or 0
    )
    last_week_rev = (
        PaymentTransaction.objects
        .filter(status='SUCCESS',
                created_at__date__range=[last_week_start, last_week_end])
        .aggregate(total=Sum('amount'))['total'] or 0
    )

    # ─── 7-DAY ORDER CHART DATA ────────────────────────────────────────────────
    # Build a full 7-day date range so gaps are filled with 0
    date_range = [(seven_days_ago + timedelta(days=i)) for i in range(7)]
    day_labels = [d.strftime('%a') for d in date_range]

    # Retail orders per day
    retail_daily = {
        row['day']: row['count']
        for row in RetailOrder.objects
            .filter(created_at__date__gte=seven_days_ago)
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(count=Count('id'))
    }
    # Food orders per day
    food_daily = {
        row['day']: row['count']
        for row in FoodOrder.objects
            .filter(created_at__date__gte=seven_days_ago)
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(count=Count('id'))
    }
    # Revenue per day
    revenue_daily = {
        row['day']: float(row['total'] or 0)
        for row in PaymentTransaction.objects
            .filter(status='SUCCESS', created_at__date__gte=seven_days_ago)
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(total=Sum('amount'))
    }

    retail_data  = [retail_daily.get(d, 0)  for d in date_range]
    food_data    = [food_daily.get(d, 0)    for d in date_range]
    revenue_data = [revenue_daily.get(d, 0) for d in date_range]

    # ─── TRENDING RETAIL PRODUCTS ──────────────────────────────────────────────
    two_weeks = today - timedelta(days=14)
    top_products = (
        RetailOrderItem.objects
        .filter(order__created_at__date__gte=two_weeks)
        .values('product__name')
        .annotate(total_sold=Count('id'), revenue=Sum('price_at_time'))
        .order_by('-total_sold')[:7]
    )

    max_sold = max((p['total_sold'] for p in top_products), default=1)
    trending = [
        {
            'name': p['product__name'],
            'sold': p['total_sold'],
            'revenue': float(p['revenue'] or 0),
            'pct': round((p['total_sold'] / max_sold) * 100),
        }
        for p in top_products
    ]

    context.update({
        # ── KPI Cards ──────────────────────────────────────────────────────────
        "kpi": [
            {
                "title": "Platform Users",
                "metric": str(total_users),
                "footer": f"{total_buyers} buyers · {total_sellers} sellers",
            },
            {
                "title": "Active Stores",
                "metric": str(total_stores),
                "footer": "Registered merchants",
            },
            {
                "title": "Pending Orders",
                "metric": str(total_pending),
                "footer": f"{retail_pending} retail · {food_pending} food",
            },
            {
                "title": "Platform Earnings",
                "metric": f"ETB {lifetime_earnings:,.0f}",
                "footer": "All-time successful payments",
            },
        ],
        # ── Charts ─────────────────────────────────────────────────────────────
        "chart_labels":       day_labels,
        "chart_retail":       retail_data,
        "chart_food":         food_data,
        "chart_revenue":      revenue_data,
        # ── Revenue cards ──────────────────────────────────────────────────────
        "this_week_rev":      f"ETB {this_week_rev:,.2f}",
        "last_week_rev":      f"ETB {last_week_rev:,.2f}",
        # ── Trending ───────────────────────────────────────────────────────────
        "trending_products":  trending,
    })

    return context
