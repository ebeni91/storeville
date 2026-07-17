import logging
from django.db import connection

logger = logging.getLogger(__name__)

class RoleSyncService:
    @staticmethod
    def promote_to_seller(user):
        """
        Promotes a CUSTOMER to a SELLER and syncs the role to the Better Auth table.
        """
        if user.role != 'CUSTOMER':
            return False

        # Update Django User
        user.role = 'SELLER'
        user.save(update_fields=['role'])
        logger.info(f"[RoleSyncService] Promoted user {user.id} to SELLER.")

        # Sync to Better Auth Postgres table
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    'UPDATE "user" SET role = %s WHERE email = %s',
                    ['SELLER', user.email]
                )
                logger.info(f"[RoleSyncService] Synced SELLER role to Better Auth table for {user.email}.")
        except Exception as e:
            logger.error(f"[RoleSyncService] Failed to sync role to Better Auth table: {e}")
            
        return True
