from django.urls import path
from .views import (
    LoginAPIView, RegistrationAPIView, UserRetrieveUpdateAPIView,
    index, reg, log, profile, analyze, modules, comparatibe_analysis_view,
    predictive_analysis_view, DescriptiveStatsApi,
    FileUploadApi, GenerateChartApi, CustomAnalysisApi
)

app_name = 'authentication'

urlpatterns = [
    path("", index, name="index"),
    path("log", log, name="log"),
    path("reg", reg, name="reg"),
    path('analyze/', analyze, name='analyze'),
    path("profile", profile, name="profile"),
    path("modules", modules, name="modules"),
    path('get_descriptive_stats/', DescriptiveStatsApi.as_view(), name='get_descriptive_stats'),
    path('predictive-analysis/', predictive_analysis_view, name='predictive_analysis'),
    path('comparatibe-analysis/', comparatibe_analysis_view, name='comparatibe_analysis'),
    path('custom-analyze/', CustomAnalysisApi.as_view(), name='custom_analyze'),
    path('api/users/', RegistrationAPIView.as_view()),
    path('api/users/login/', LoginAPIView.as_view()),
    path('api/user/', UserRetrieveUpdateAPIView.as_view()),
    path('upload/', FileUploadApi.as_view(), name='upload_file'),
    path('generate-chart/', GenerateChartApi.as_view(), name='generate_chart'),
]
