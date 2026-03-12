from rest_framework.views import exception_handler
import logging

logger = logging.getLogger(__name__)

def enterprise_exception_handler(exc, context):
    """
    Custom exception handler to standardize all API errors into:
    { "error": true, "message": "...", "details": {...} }
    """
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    if response is not None:
        # Standardize the output format
        custom_response_data = {
            'error': True,
            'message': 'A validation or permission error occurred.',
            'details': response.data
        }
        
        # If it's a 403 or 401, give a clearer message
        if response.status_code == 401:
            custom_response_data['message'] = 'Authentication credentials were not provided or are invalid.'
        elif response.status_code == 403:
            custom_response_data['message'] = 'You do not have permission to perform this action.'
            
        response.data = custom_response_data
    else:
        # If response is None, it means it's a 500 Server Error (unhandled Python exception)
        logger.error(f"Unhandled Exception: {str(exc)}", exc_info=True)
        # We don't return the raw Python stack trace to the user for security reasons.

    return response