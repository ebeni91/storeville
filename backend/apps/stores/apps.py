from django.apps import AppConfig

class StoresConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.stores'

    def ready(self):
        # ✅ ARCHITECTURE FIX: Register signals here rather than at module import time.
        # Importing in ready() guarantees the handler is registered exactly once,
        # even if models.py is imported multiple times (e.g., during test discovery).
        import apps.stores.signals  # noqa: F401
