from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
import random

# Simple serializer for Registration
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            validated_data['username'],
            validated_data['email'],
            validated_data['password']
        )
        return user

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

class PredictionView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        # Simulated ML Prediction logic
        # In a real app, this would use a pre-trained scikit-learn model
        efficiency = round(random.uniform(70, 95), 2)
        downtime_prob = round(random.uniform(5, 20), 2)
        
        data = {
            "efficiency": efficiency,
            "downtime_probability": downtime_prob,
            "status": "Optimal" if efficiency > 85 else "Action Required",
            "recommendation": "Maintain current speed" if efficiency > 85 else "Check machine lubrication"
        }
        return Response(data, status=status.HTTP_200_OK)
