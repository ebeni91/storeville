from rest_framework import generics, permissions, status, viewsets
from .serializers import UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer, CustomTokenRefreshSerializer, CustomerAddressSerializer, SavedPaymentMethodSerializer
from .models import CustomerAddress, SavedPaymentMethod
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

class ProfileView(generics.RetrieveUpdateDestroyAPIView):
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
                
                # Determine cookie name based on role
                role = response.data.get('user', {}).get('role')
                cookie_name = 'seller_refresh_token' if role == 'SELLER' else 'buyer_refresh_token'
                
                # Simplified secure cookie setting
                response.set_cookie(
                    key=cookie_name,
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
        # 1. Safely grab the cookie based on the intended zone
        zone = request.headers.get('X-Auth-Zone', 'buyer')
        cookie_name = 'seller_refresh_token' if zone == 'seller' else 'buyer_refresh_token'
        refresh_token = request.COOKIES.get(cookie_name)
        
        if not refresh_token:
            raise InvalidToken(f'No valid {zone} refresh token found in cookies.')

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
                key=cookie_name,
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
        
        # Determine which zone is logging out
        zone = request.headers.get('X-Auth-Zone', 'buyer')
        cookie_name = 'seller_refresh_token' if zone == 'seller' else 'buyer_refresh_token'
        
        response.delete_cookie(cookie_name)
        
        return response

class CustomerAddressViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerAddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CustomerAddress.objects.filter(user=self.request.user)

class SavedPaymentMethodViewSet(viewsets.ModelViewSet):
    serializer_class = SavedPaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedPaymentMethod.objects.filter(user=self.request.user)