from rest_framework import generics, permissions
from .serializers import UserSerializer, RegisterSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken
from django.conf import settings
from .serializers import CustomTokenObtainPairSerializer, CustomTokenRefreshSerializer
User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    # Uses the default IsAuthenticated permission from settings

    def get_object(self):
        # Security: A user can only fetch their own profile, not someone else's via ID
        return self.request.user
    
def get_cookie_domain():
    return f".{settings.BASE_DOMAIN}" if hasattr(settings, 'BASE_DOMAIN') else None

class CookieTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer 
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            refresh_token = response.data.get('refresh')
            if refresh_token:
                del response.data['refresh']
                
                response.set_cookie(
                    key='refresh_token',
                    value=refresh_token,
                    domain=get_cookie_domain(), # <--- Share across subdomains
                    httponly=True,
                    secure=not settings.DEBUG, 
                    samesite='Lax',
                    max_age=24 * 60 * 60 * 7 
                )
        return response

class CookieTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer # <--- Use the new serializer

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            raise InvalidToken('No valid refresh token found in cookies.')
            
        request.data['refresh'] = refresh_token
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200 and 'refresh' in response.data:
            new_refresh_token = response.data.get('refresh')
            del response.data['refresh']
            
            response.set_cookie(
                key='refresh_token',
                value=new_refresh_token,
                domain=get_cookie_domain(), # <--- Share across subdomains
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax',
                max_age=24 * 60 * 60 * 7
            )
        return response