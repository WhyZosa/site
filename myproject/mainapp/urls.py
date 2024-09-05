from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='login'),
    path('registration/', views.registration, name='registration'),
    path('welcome/', views.welcome, name='welcome'),
    path('profile/', views.profile, name='profile'),
    path('logout/', views.logout_view, name='logout'),
]
