from rest_framework import generics, permissions,status
from .serializers import UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer, CustomTokenRefreshSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
    
class CookieTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer 
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            refresh_token = response.data.get('refresh')
            if refresh_token:
                del response.data['refresh']
                
                # Simplified secure cookie setting
                response.set_cookie(
                    key='refresh_token',
                    value=refresh_token,
                    httponly=True,
                    secure=not settings.DEBUG, 
                    samesite='Lax',
                    max_age=24 * 60 * 60 * 7 
                )
        return response

class CookieTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer 

    def post(self, request, *args, **kwargs):
        # 1. Safely grab the cookie
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            raise InvalidToken('No valid refresh token found in cookies.')

        # 2. Feed directly to serializer
        serializer = self.get_serializer(data={'refresh': refresh_token})
        
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            raise InvalidToken(e.args[0])

        # 3. Format Response
        data = serializer.validated_data
        new_refresh_token = data.get('refresh')
        
        if new_refresh_token:
            del data['refresh']
            
        response = Response(data, status=200)

        # 4. Set the new cookie
        if new_refresh_token:
            response.set_cookie(
                key='refresh_token',
                value=new_refresh_token,
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax',
                max_age=24 * 60 * 60 * 7
            )
        return response


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        response = Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        
        response.delete_cookie('refresh_token')
        
        return response