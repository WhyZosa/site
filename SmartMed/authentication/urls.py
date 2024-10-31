"""
URL configuration for the authentication app.

This module defines the URL patterns for the app, including routes for
registration, login, profile, and data analysis.
"""

from django.urls import path
from .views import (
    LoginAPIView, RegistrationAPIView, UserRetrieveUpdateAPIView,
    index, reg, log, profile, analyze, DashboardApi  # Добавляем DashboardApi
)

# pylint: disable=C0103
app_name = 'authentication'

urlpatterns = [
    path("", index, name="index"),
    path("log", log, name="log"),
    path("reg", reg, name="reg"),
    path("analyze", analyze, name="analyze"),
    path("profile", profile, name="profile"),
    path('api/users/', RegistrationAPIView.as_view()),
    path('api/users/login/', LoginAPIView.as_view()),
    path('api/user/', UserRetrieveUpdateAPIView.as_view()),
    path('upload/', DashboardApi.as_view(), name='upload_file'),  # Используем DashboardApi напрямую
]
