from django.apps import AppConfig

class StoresConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.stores'

    def ready(self):
        # Register signals in ready() rather than at module import time.
        # This guarantees the handler is registered exactly once, avoiding duplicate
        # registrations if models.py is imported multiple times (e.g., during test discovery).
        import apps.stores.signals  # noqa: F401
