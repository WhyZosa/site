from django.urls import path

from .views import (
    LoginAPIView, RegistrationAPIView, UserRetrieveUpdateAPIView,
    index,reg,log,profile
)

app_name = 'authentication'
urlpatterns = [
    path("", index, name="index"),
    path("log", log, name="log"),
    path("reg", reg, name="reg"),
    path("profile", profile, name="profile"),
    path('api/users/', RegistrationAPIView.as_view()),
    path('api/users/login/', LoginAPIView.as_view()),
    path('api/user/', UserRetrieveUpdateAPIView.as_view()),
]
