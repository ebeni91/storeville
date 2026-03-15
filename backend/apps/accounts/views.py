from rest_framework import generics, permissions
from .serializers import UserSerializer, RegisterSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken
from django.conf import settings
from .serializers import CustomTokenObtainPairSerializer # <-- Add this import
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
    
class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        # 1. Get the normal JWT response
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # 2. Extract the refresh token
            refresh_token = response.data.get('refresh')
            
            if refresh_token:
                # 3. Delete it from the JSON body (so JavaScript can't see it)
                del response.data['refresh']
                
                # 4. Attach it as an HttpOnly cookie!
                # Note: secure=True should be used in production with HTTPS
                response.set_cookie(
                    key='refresh_token',
                    value=refresh_token,
                    httponly=True,
                    secure=not settings.DEBUG, 
                    samesite='Lax',
                    max_age=24 * 60 * 60 * 7 # 7 days (Matches your refresh token lifetime)
                )
                
        return response

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        # 1. Read the refresh token directly from the secure cookie
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            raise InvalidToken('No valid refresh token found in cookies.')
            
        # 2. Inject it into the request data so SimpleJWT can validate it normally
        request.data['refresh'] = refresh_token
        
        return super().post(request, *args, **kwargs)
    

class CookieTokenObtainPairView(TokenObtainPairView):
    # <-- TELL DJANGO TO USE OUR NEW SERIALIZER
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
                    httponly=True,
                    secure=not settings.DEBUG, 
                    samesite='Lax',
                    max_age=24 * 60 * 60 * 7 
                )
                
        return response