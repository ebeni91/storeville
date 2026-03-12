from django.urls import path
from .views import InitializePaymentView, ChapaWebhookView

urlpatterns = [
    # Frontend calls this
    path('initialize/', InitializePaymentView.as_view(), name='initialize-payment'),
    
    # Chapa calls this
    path('webhook/chapa/', ChapaWebhookView.as_view(), name='chapa-webhook'),
]