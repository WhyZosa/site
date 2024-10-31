import json
import base64
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from io import StringIO
import numpy as np

from django.http import JsonResponse
from django.shortcuts import render
import logging

from rest_framework import status
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .renderers import UserJSONRenderer
from .serializers import LoginSerializer, RegistrationSerializer, UserSerializer

# Настройка логирования для отладки
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def process_missing_data(df, method):
    if method == 'drop':
        return df.dropna()
    elif method == 'fill_mean':
        return df.fillna(df.mean())
    elif method == 'fill_median':
        return df.fillna(df.median())
    elif method == 'fill_mode':
        return df.fillna(df.mode().iloc[0])
    else:
        return df

def get_existing_columns(df, columns):
    """Проверка существующих столбцов в DataFrame"""
    return [col for col in columns if col in df.columns]

def get_all_columns(df):
    """Возвращает все столбцы из DataFrame"""
    return df.columns.tolist()

def generate_scatter_matrix(df, columns):
    logger.debug(f"Генерация scatter matrix для столбцов: {columns}")
    fig = px.scatter_matrix(df, dimensions=columns)
    return fig

def generate_histogram(df, columns):
    logger.debug(f"Генерация гистограммы для столбцов: {columns}")
    fig = px.histogram(df, x=columns)
    return fig

def generate_heatmap(df, columns):
    logger.debug(f"Генерация тепловой карты для столбцов: {columns}")
    corr_matrix = df[columns].corr()
    fig = px.imshow(corr_matrix, text_auto=True, color_continuous_scale='RdBu_r')
    return fig

def generate_scatter_plot(df, x_column, y_column):
    logger.debug(f"Генерация scatter plot для столбцов X: {x_column}, Y: {y_column}")
    fig = px.scatter(df, x=x_column, y=y_column)
    return fig

def generate_box_plot(df, columns):
    logger.debug(f"Генерация box plot для столбцов: {columns}")
    fig = px.box(df, y=columns)
    return fig

def generate_pie_chart(df, column):
    logger.debug(f"Генерация круговой диаграммы для столбца: {column}")
    fig = px.pie(df, names=column)
    return fig

def generate_multiple_histograms(df, columns):
    logger.debug(f"Генерация нескольких гистограмм для столбцов: {columns}")
    fig = go.Figure()
    for col in columns:
        fig.add_trace(go.Histogram(x=df[col], name=col))
    fig.update_layout(barmode='overlay')
    fig.update_traces(opacity=0.75)
    return fig

def generate_line_chart(df, x_column, y_column):
    logger.debug(f"Генерация линейного графика для столбцов X: {x_column}, Y: {y_column}")
    fig = px.line(df, x=x_column, y=y_column)
    return fig

def generate_logarithmic_chart(df, x_column, y_column):
    logger.debug(f"Генерация логарифмического графика для столбцов X: {x_column}, Y: {y_column}")
    fig = px.line(df, x=x_column, y=y_column)
    fig.update_layout(yaxis_type="log")
    return fig

def convert_ndarray_to_list(data):
    """Рекурсивная функция для преобразования всех объектов ndarray в списки"""
    if isinstance(data, np.ndarray):
        return data.tolist()
    elif isinstance(data, dict):
        return {key: convert_ndarray_to_list(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [convert_ndarray_to_list(item) for item in data]
    else:
        return data

def get_alternative_columns(df, num_columns=2):
    """Возвращает первые num_columns столбцов из DataFrame"""
    available_columns = df.columns.tolist()
    return available_columns[:num_columns]

def process_json(input_json):
    logger.debug(f"Обработка входного JSON: {input_json}")
    user_input = json.loads(input_json)
    df_json = user_input.get('data_path')
    missing_data_method = user_input.get('missing_data_method', 'fill_mean')
    graphs = user_input.get('graphs', [])

    # Чтение данных из JSON в DataFrame
    df = pd.read_json(StringIO(df_json))
    df = process_missing_data(df, missing_data_method)

    output = {}

    columns = get_all_columns(df)  # Получаем все столбцы

    for graph in graphs:
        graph_type = graph.get('type')
        fig = None

        if graph_type == 'scatter_matrix':
            fig = generate_scatter_matrix(df, columns)

        elif graph_type == 'heatmap':
            fig = generate_heatmap(df, columns)

        elif graph_type == 'multiple_histograms':
            fig = generate_multiple_histograms(df, columns)

        elif graph_type == 'scatter_plot':
            # Генерация scatter plot для каждой пары столбцов
            for i, x_col in enumerate(columns):
                for j, y_col in enumerate(columns):
                    if i != j:
                        fig = generate_scatter_plot(df, x_col, y_col)
                        output[f"scatter_plot_{x_col}_vs_{y_col}"] = convert_ndarray_to_list(fig.to_dict())

        elif graph_type == 'box_plot':
            # Генерация box plot для каждого столбца
            for col in columns:
                fig = generate_box_plot(df, [col])
                output[f"box_plot_{col}"] = convert_ndarray_to_list(fig.to_dict())

        elif graph_type == 'line_chart':
            # Генерация line chart для каждой пары столбцов
            for i, x_col in enumerate(columns):
                for j, y_col in enumerate(columns):
                    if i != j:
                        fig = generate_line_chart(df, x_col, y_col)
                        output[f"line_chart_{x_col}_vs_{y_col}"] = convert_ndarray_to_list(fig.to_dict())

        elif graph_type == 'logarithmic_chart':
            # Генерация logarithmic chart для каждой пары столбцов
            for i, x_col in enumerate(columns):
                for j, y_col in enumerate(columns):
                    if i != j:
                        fig = generate_logarithmic_chart(df, x_col, y_col)
                        output[f"logarithmic_chart_{x_col}_vs_{y_col}"] = convert_ndarray_to_list(fig.to_dict())

        elif graph_type == 'histogram':
            fig = generate_histogram(df, columns)

        elif graph_type == 'pie_chart':
            # Генерация pie chart для каждого столбца
            for col in columns:
                if df[col].nunique() <= 10:  # Ограничение для pie_chart
                    fig = generate_pie_chart(df, col)
                    output[f"pie_chart_{col}"] = convert_ndarray_to_list(fig.to_dict())

        # Сохраняем графики
        if fig and graph_type not in output:
            output[graph_type] = convert_ndarray_to_list(fig.to_dict())

    return output  # Возвращаем словарь

class DashboardApi(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logger.debug("Началась обработка загруженного файла")
        file = request.FILES.get('file')

        if not file:
            logger.error("Файл не загружен")
            return JsonResponse({'error': 'Файл не загружен'}, status=400)

        try:
            # Определяем тип файла (CSV или Excel)
            if file.name.endswith('.csv'):
                df = pd.read_csv(file)
            elif file.name.endswith('.xls') or file.name.endswith('.xlsx'):
                df = pd.read_excel(file)
            else:
                logger.error(f"Неподдерживаемый формат файла: {file.name}")
                return JsonResponse({'error': 'Неподдерживаемый формат файла. Допустимы только .csv, .xls, .xlsx'}, status=400)

            df_json = df.to_json()

            input_json = {
                "data_path": df_json,
                "missing_data_method": "fill_mean",
                "graphs": [
                    {"type": "scatter_matrix"},
                    {"type": "histogram"},
                    {"type": "heatmap"},
                    {"type": "scatter_plot"},
                    {"type": "box_plot"},
                    {"type": "pie_chart"},
                    {"type": "multiple_histograms"},
                    {"type": "line_chart"},
                    {"type": "logarithmic_chart"}
                ]
            }

            logger.debug("Начинается процесс обработки JSON")
            result = process_json(json.dumps(input_json))

            # Добавляем список столбцов в ответ
            columns = df.columns.tolist()
            result['columns'] = columns

            logger.debug("Возвращаем результат в виде объекта JSON")
            return JsonResponse(result, status=200)

        except ValueError as e:
            logger.error(f"Ошибка в данных: {str(e)}")
            return JsonResponse({'error': 'Ошибка в данных'}, status=400)
        except IOError as e:
            logger.error(f"Ошибка ввода/вывода: {str(e)}")
            return JsonResponse({'error': 'Ошибка ввода/вывода'}, status=500)
        except Exception as e:
            logger.error(f"Произошла непредвиденная ошибка: {str(e)}")
            return JsonResponse({'error': f'Произошла непредвиденная ошибка: {str(e)}'}, status=500)

class RegistrationAPIView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = RegistrationSerializer
    renderer_classes = (UserJSONRenderer,)

    def post(self, request):
        user = request.data.get('user', {})
        serializer = self.serializer_class(data=user)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class LoginAPIView(APIView):
    permission_classes = (AllowAny,)
    renderer_classes = (UserJSONRenderer,)
    serializer_class = LoginSerializer

    def post(self, request):
        logger.debug(f"Попытка входа: {request.data}")
        user = request.data.get('user', {})
        serializer = self.serializer_class(data=user)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserRetrieveUpdateAPIView(RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    renderer_classes = (UserJSONRenderer,)
    serializer_class = UserSerializer

    def retrieve(self, request, *args, **kwargs):
        serializer = self.serializer_class(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        serializer_data = request.data.get('user', {})
        serializer = self.serializer_class(request.user, data=serializer_data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

# Представление для страницы регистрации
def reg(request):
    return render(request, "authentication/registration.html")

# Представление для страницы логина
def log(request):
    return render(request, "authentication/login.html")

# Представление для главной страницы
def index(request):
    return render(request, "authentication/welcome.html")

# Представление для профиля пользователя
def profile(request):
    return render(request, "authentication/profile.html")

# Представление для страницы анализа данных
def analyze(request):
    logger.debug("Отображение страницы анализа данных")
    return render(request, "authentication/analyze.html")

