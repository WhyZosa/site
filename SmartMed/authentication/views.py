import json
import logging
import pandas as pd
import tempfile
import os
import numpy as np

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import status
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .renderers import UserJSONRenderer
from .serializers import LoginSerializer, RegistrationSerializer, UserSerializer
from .descriptive import process_json_descriptive
from .comparatibe import process_json_comparative

# Настройка логирования для отладки
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Глобальная переменная для хранения загруженного DataFrame для каждого пользователя
DATAFRAME_STORAGE = {}

class RegistrationAPIView(APIView):
    """
    Эндпоинт для регистрации пользователей.
    """
    permission_classes = (AllowAny,)
    serializer_class = RegistrationSerializer
    renderer_classes = (UserJSONRenderer,)

    def post(self, request):
        """
        Обрабатывает POST-запрос для регистрации нового пользователя.
        """
        user = request.data.get('user', {})
        serializer = self.serializer_class(data=user)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class LoginAPIView(APIView):
    """
    Эндпоинт для входа пользователей.
    """
    permission_classes = (AllowAny,)
    renderer_classes = (UserJSONRenderer,)
    serializer_class = LoginSerializer

    def post(self, request):
        """
        Обрабатывает POST-запрос для аутентификации пользователя.
        """
        user = request.data.get('user', {})
        serializer = self.serializer_class(data=user)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserRetrieveUpdateAPIView(RetrieveUpdateAPIView):
    """
    Эндпоинт для получения и обновления данных профиля пользователя.
    """
    permission_classes = (IsAuthenticated,)
    renderer_classes = (UserJSONRenderer,)
    serializer_class = UserSerializer

    def retrieve(self, request, *args, **kwargs):
        """
        Возвращает данные текущего аутентифицированного пользователя.
        """
        serializer = self.serializer_class(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        """
        Обновляет данные профиля текущего аутентифицированного пользователя.
        """
        serializer_data = request.data.get('user', {})
        serializer = self.serializer_class(request.user, data=serializer_data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

def reg(request):
    """
    Представление для страницы регистрации.
    """
    return render(request, "authentication/registration.html")

def log(request):
    """
    Представление для страницы входа.
    """
    return render(request, "authentication/login.html")

def index(request):
    """
    Представление для главной страницы.
    """
    return render(request, "authentication/welcome.html")

def profile(request):
    """
    Представление для страницы профиля пользователя.
    """
    return render(request, "authentication/profile.html")

def analyze(request):
    """
    Представление для страницы анализа данных.
    """
    return render(request, "authentication/analyze.html")

def modules(request):
    return render(request, 'authentication/modules.html')

def comparatibe_analysis_view(request):
    return render(request, 'authentication/comparatibe_analysis.html')

def predictive_analysis_view(request):
    """
    Представление для страницы предсказательного анализа.
    """
    return render(request, 'authentication/predictive.html')

@method_decorator(csrf_exempt, name='dispatch')
class FileUploadApi(APIView):
    """
    API для загрузки файла
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.user.id
        file = request.FILES.get('file')

        if not file:
            return JsonResponse({'error': 'Файл не найден'}, status=400)

        try:
            # Проверка типа файла
            if not file.name.endswith(('.xls', '.xlsx', '.csv')):
                return JsonResponse({'error': 'Неверный тип файла'}, status=400)

            if file.name.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(file)
            else:
                df = pd.read_csv(file)

            DATAFRAME_STORAGE[user_id] = df
            columns = df.columns.tolist()
            logger.debug("Загруженные колонки: %s", columns)
            return JsonResponse({'message': 'Файл успешно загружен', 'columns': columns}, status=200)
        except Exception as e:
            logger.error("Ошибка при обработке загруженного файла: %s", str(e))
            return JsonResponse({'error': f'Ошибка при обработке файла'}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class DescriptiveStatsApi(APIView):
    """
    API для получения описательной статистики по загруженному файлу.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id
        df = DATAFRAME_STORAGE.get(user_id)

        if df is None:
            return JsonResponse({'error': 'Данные не найдены. Сначала загрузите файл.'}, status=400)

        try:
            # Получаем описательную статистику
            desc = df.describe(include='all').T.fillna('')
            stats_dict = desc.to_dict()

            # Инициализация метрик для геометрического среднего и вариации
            geom_mean = {}
            variation = {}

            # Обработка числовых столбцов
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            for col in numeric_cols:
                positive_values = df[col].dropna()
                positive_values = positive_values[positive_values > 0]
                if len(positive_values) > 0:
                    gmean = np.exp(np.mean(np.log(positive_values)))
                    geom_mean[col] = gmean
                    # Вариация = std/mean
                    if positive_values.mean() != 0:
                        variation[col] = positive_values.std() / positive_values.mean()
                    else:
                        variation[col] = ''
                else:
                    geom_mean[col] = ''
                    variation[col] = ''

            # Перестраиваем stats_dict для соответствия по колонкам
            per_column_stats = {}
            for metric, columns in stats_dict.items():
                for col, value in columns.items():
                    if col not in per_column_stats:
                        per_column_stats[col] = {}
                    per_column_stats[col][metric] = value

            # Добавляем показатели geom_mean и variation только для числовых столбцов
            for col in numeric_cols:
                per_column_stats[col]['geom_mean'] = geom_mean.get(col, '-')
                per_column_stats[col]['variation'] = variation.get(col, '-')

            # Проверка наличия хотя бы одной числовой колонки
            if not len(numeric_cols):
                return JsonResponse({'error': 'В загруженном файле нет числовых столбцов для отображения метрик.'}, status=400)

            return JsonResponse({'stats': per_column_stats}, json_dumps_params={'ensure_ascii': False, 'indent': 2}, status=200)
        except Exception as e:
            logger.error("Ошибка при формировании статистики: %s", str(e))
            return JsonResponse({'error': 'Ошибка при формировании статистики.'}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class GenerateChartApi(APIView):
    """
    API для генерации графика на основе выбранных параметров.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Обрабатывает POST-запрос для генерации графика.
        """
        user_id = request.user.id
        df = DATAFRAME_STORAGE.get(user_id)

        if df is None:
            return JsonResponse({'error': 'Данные не найдены. Пожалуйста, загрузите файл сначала.'}, status=400)

        chart_type = request.data.get('chart_type')
        x_axis = request.data.get('x_axis')
        y_axis = request.data.get('y_axis')
        selected_columns = request.data.get('selected_columns', df.columns.tolist())
        column = request.data.get('column', '')

        logger.debug("Полученные данные от клиента:")
        logger.debug(f"chart_type: {chart_type}")
        logger.debug(f"x_axis: {x_axis}")
        logger.debug(f"y_axis: {y_axis}")
        logger.debug(f"selected_columns: {selected_columns}")
        logger.debug(f"column: {column}")

        if chart_type in ['scatter_plot', 'line_chart', 'logarithmic_chart'] and (not x_axis or not y_axis):
            return JsonResponse({'error': 'Для данного типа графика необходимо указать оси X и Y.'}, status=400)
        if chart_type == 'pie_chart' and not column:
            return JsonResponse({'error': 'Для круговой диаграммы необходимо выбрать столбец.'}, status=400)

        try:
            # Создаем временный файл с данными
            with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as temp_file:
                df.to_excel(temp_file.name, index=False)
                temp_file_path = temp_file.name

            # Формируем входные данные для process_json_descriptive
            input_json = {
                "data_path": temp_file_path,
                "missing_data_method": "fill_mean",
                "graphs": [
                    {
                        "type": chart_type,
                        "columns": selected_columns,
                        "x": x_axis,
                        "y": y_axis,
                        "column": column
                    }
                ]
            }

            result = process_json_descriptive(json.dumps(input_json))
            logger.debug("Результат process_json_descriptive: %s", result)

            # Удаляем временный файл
            os.remove(temp_file_path)

            if isinstance(result, str):
                result = json.loads(result)

            graph_data = result.get(chart_type)
            if graph_data and 'figure' in graph_data:
                return JsonResponse(graph_data, status=200)
            else:
                error_message = graph_data.get('error', 'Неизвестная ошибка при генерации графика.') if graph_data else 'Неизвестная ошибка при генерации графика.'
                return JsonResponse({'error': error_message}, status=400)

        except Exception as e:
            logger.error("Ошибка при генерации графика: %s", str(e))
            return JsonResponse({'error': f'Ошибка при генерации графика: {str(e)}'}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class CustomAnalysisApi(APIView):
    """
    API для обработки пользовательского анализа.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.user.id
        logger.debug("Получен запрос на анализ от пользователя ID: %s", user_id)

        df = DATAFRAME_STORAGE.get(user_id)
        if df is None:
            logger.error("Данные не найдены для пользователя ID: %s", user_id)
            return JsonResponse({'error': 'Данные не найдены. Пожалуйста, загрузите файл сначала.'}, status=400)

        analysis_type = request.data.get('tests', [])
        if not analysis_type:
            logger.error("Не указаны тесты в запросе.")
            return JsonResponse({'error': 'Не указаны тесты для анализа.'}, status=400)

        try:
            # Создаем временный файл с данными
            with tempfile.NamedTemporaryFile(delete=False, suffix='.csv') as temp_file:
                df.to_csv(temp_file.name, index=False)
                temp_file_path = temp_file.name

            input_json = {
                "data_path": temp_file_path,
                "tests": analysis_type,
                "missing_data_method": "fill_mean"
            }

            result = process_json_comparative(json.dumps(input_json))
            logger.debug("Результат анализа: %s", result)

            os.remove(temp_file_path)

            if isinstance(result, str):
                result = json.loads(result)

            if not result or (isinstance(result, dict) and not any(result.values())):
                logger.warning("Анализ завершился без результатов. Проверьте данные.")
                return JsonResponse({'error': 'Анализ завершился без результатов. Проверьте данные.'}, status=200)

            formatted_result = {
                "Анализ": analysis_type[0]['type'],
                "Колонка 1": analysis_type[0].get('column1'),
                "Колонка 2": analysis_type[0].get('column2'),
                "Результаты": result
            }

            logger.debug("Форматированный результат: %s", formatted_result)
            return JsonResponse(formatted_result, json_dumps_params={'ensure_ascii': False, 'indent': 2}, status=200)

        except Exception as e:
            logger.error("Ошибка выполнения анализа: %s", str(e))
            return JsonResponse({'error': f'Ошибка выполнения анализа: {str(e)}'}, status=500)
