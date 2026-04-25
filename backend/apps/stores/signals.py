from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender='stores.Store')
def create_store_theme(sender, instance, created, **kwargs):
    """
    Auto-create a StoreTheme record whenever a new Store is saved.
    Registered via StoresConfig.ready() to prevent double-registration
    during testing or multiple imports.
    """
    if created:
        from .models import StoreTheme
        StoreTheme.objects.get_or_create(store=instance)
