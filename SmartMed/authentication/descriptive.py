import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import json
import plotly
import numpy as np

def process_missing_data(df, method):
    if method == 'drop':
        return df.dropna()
    elif method == 'fill_mean':
        return df.fillna(df.mean(numeric_only=True))
    elif method == 'fill_median':
        return df.fillna(df.median(numeric_only=True))
    elif method == 'fill_mode':
        return df.fillna(df.mode().iloc[0])
    else:
        return df  # If method is not specified or unrecognized

def generate_descriptive_table(df):
    desc_table = df.describe().to_json()
    return desc_table

def generate_scatter_matrix(df, columns):
    # Ensure at least two columns are selected
    if len(columns) < 2:
        raise ValueError("Для построения матрицы рассеяния необходимо выбрать как минимум два столбца.")

    df_copy = df[columns].copy()

    # Convert non-numeric columns to numeric
    for col in columns:
        if not pd.api.types.is_numeric_dtype(df_copy[col]):
            df_copy[col], _ = pd.factorize(df_copy[col])

    # Create list of dimensions with labels
    dimensions = [dict(label=col, values=df_copy[col]) for col in columns]

    fig = go.Figure(data=go.Splom(
        dimensions=dimensions,
        showupperhalf=False,
        diagonal_visible=False,
        marker=dict(
            size=5,
            color='rgba(0, 0, 152, 0.4)',
            showscale=False,
            line_color='white',
            line_width=0.5
        )
    ))

    # Update axis labels using first column for X and second for Y
    fig.update_layout(
        title="Матрица рассеяния",
        title_font_size=20,
        dragmode=False,
        hovermode='closest',
        autosize=True,
        font=dict(size=12),
        xaxis=dict(
            title=dict(
                text=columns[0],  # First column for X-axis
                font=dict(size=14)
            )
        ),
        yaxis=dict(
            title=dict(
                text=columns[1],  # Second column for Y-axis
                font=dict(size=14)
            )
        )
    )

    return fig

def generate_histogram(df, columns):
    if len(columns) == 0:
        raise ValueError("Для построения гистограммы необходимо выбрать хотя бы один столбец.")

    fig = go.Figure()
    for col in columns:
        # Convert non-numeric columns to numeric
        if not pd.api.types.is_numeric_dtype(df[col]):
            df[col], _ = pd.factorize(df[col])

        fig.add_trace(go.Histogram(
            x=df[col],
            name=col,
            opacity=0.75
        ))

    fig.update_layout(
        barmode='overlay',
        title="Гистограмма",
        title_font_size=20,
        xaxis_title="Значения",
        yaxis_title="Частота",
        xaxis_title_font_size=16,
        yaxis_title_font_size=16
    )

    return fig

def generate_heatmap(df, columns):
    numeric_columns = df[columns].select_dtypes(include=[np.number]).columns.tolist()
    if not numeric_columns or len(numeric_columns) < 2:
        raise ValueError("Для построения heatmap необходимо выбрать как минимум два числовых столбца.")
    numeric_df = df[numeric_columns]
    corr_matrix = numeric_df.corr()
    fig = px.imshow(
        corr_matrix,
        text_auto='.2f',
        aspect='auto',
        color_continuous_scale='RdBu_r',
        title="Корреляционная матрица",
        labels={'color': 'Корреляция'}
    )
    fig.update_layout(
        title_font_size=20,
        xaxis_title="Показатели",
        yaxis_title="Показатели",
        xaxis_tickangle=-45
    )
    return fig

def generate_scatter_plot(df, x_column, y_column):
    if not pd.api.types.is_numeric_dtype(df[x_column]) or not pd.api.types.is_numeric_dtype(df[y_column]):
        raise ValueError("Для построения scatter plot необходимо выбрать числовые столбцы для X и Y осей.")
    fig = px.scatter(
        df,
        x=x_column,
        y=y_column,
        title=f"График разброса: {y_column} vs {x_column}",
        labels={x_column: x_column, y_column: y_column},
        trendline='ols',
        color_discrete_sequence=['#EF553B']
    )
    fig.update_traces(marker=dict(size=8))
    fig.update_layout(
        title_font_size=20,
        xaxis_title_font_size=16,
        yaxis_title_font_size=16
    )
    return fig

def generate_box_plot(df, columns):
    numeric_columns = df[columns].select_dtypes(include=[np.number]).columns.tolist()
    if not numeric_columns:
        raise ValueError("Для построения box plot необходимо выбрать числовые столбцы.")
    fig = px.box(
        df,
        y=numeric_columns,
        title="Диаграмма размаха (Box Plot)",
        labels={col: col for col in numeric_columns}
    )
    fig.update_layout(
        title_font_size=20,
        yaxis_title_font_size=16
    )
    return fig

def generate_pie_chart(df, column):
    if column not in df.columns:
        raise ValueError(f"Столбец '{column}' не найден в данных.")
    fig = px.pie(
        df,
        names=column,
        title=f"Круговая диаграмма: {column}",
        color_discrete_sequence=px.colors.qualitative.Set3
    )
    fig.update_layout(
        title_font_size=20
    )
    return fig

def generate_multiple_histograms(df, columns):
    fig = go.Figure()
    for col in columns:
        fig.add_trace(
            go.Histogram(
                x=df[col],
                name=col,
                opacity=0.75
            )
        )
    fig.update_layout(
        barmode='overlay',
        title="Множественные гистограммы",
        title_font_size=20,
        xaxis_title="Значения",
        yaxis_title="Частота",
        xaxis_title_font_size=16,
        yaxis_title_font_size=16
    )
    return fig

def generate_line_chart(df, x_column, y_column):
    fig = px.line(
        df,
        x=x_column,
        y=y_column,
        title=f"Линейный график: {y_column} vs {x_column}",
        labels={x_column: x_column, y_column: y_column},
        color_discrete_sequence=['#00CC96']
    )
    fig.update_layout(
        title_font_size=20,
        xaxis_title_font_size=16,
        yaxis_title_font_size=16
    )
    return fig

def generate_logarithmic_chart(df, x_column, y_column):
    # Check if specified columns exist in the DataFrame
    if x_column not in df.columns or y_column not in df.columns:
        raise ValueError(f"Столбцы '{x_column}' и/или '{y_column}' не найдены в данных.")

    # Create a DataFrame with only the necessary columns
    df_plot = df[[x_column, y_column]].copy()

    # Convert columns to numeric, coercing errors to NaN
    df_plot[x_column] = pd.to_numeric(df_plot[x_column], errors='coerce')
    df_plot[y_column] = pd.to_numeric(df_plot[y_column], errors='coerce')

    # Drop rows with NaN values resulting from conversion
    df_plot.dropna(subset=[x_column, y_column], inplace=True)

    # Check if there's data left after cleaning
    if df_plot.empty:
        raise ValueError("Нет допустимых числовых данных для построения графика после очистки.")

    # Generate the logarithmic chart
    fig = px.line(
        df_plot,
        x=x_column,
        y=y_column,
        title=f"Логарифмический график: {y_column} vs {x_column}",
        labels={x_column: x_column, y_column: y_column},
        color_discrete_sequence=['#AB63FA']
    )

    fig.update_layout(
        yaxis_type="log",
        title_font_size=20,
        xaxis_title_font_size=16,
        yaxis_title_font_size=16
    )

    return fig

def process_json_descriptive(input_json):
    user_input = json.loads(input_json)
    data_path = user_input.get('data_path')
    missing_data_method = user_input.get('missing_data_method', 'fill_mean')
    graphs = user_input.get('graphs', [])

    if not data_path:
        return json.dumps({'error': 'Путь к данным не указан.'})

    try:
        df = pd.read_excel(data_path)
    except Exception as e:
        return json.dumps({'error': f'Ошибка при чтении файла данных: {str(e)}'})

    df = process_missing_data(df, missing_data_method)

    output = {}

    for graph in graphs:
        graph_type = graph.get('type')
        columns = graph.get('columns', [])
        x_column = graph.get('x')
        y_column = graph.get('y')
        column = graph.get('column', '')

        try:
            fig = None

            if graph_type == 'descriptive_table':
                table = generate_descriptive_table(df)
                output[graph_type] = {
                    'title': 'Descriptive Table',
                    'table_json': table
                }
            elif graph_type == 'scatter_matrix':
                fig = generate_scatter_matrix(df, columns)
            elif graph_type == 'histogram':
                fig = generate_histogram(df, columns)
            elif graph_type == 'heatmap':
                fig = generate_heatmap(df, columns)
            elif graph_type == 'scatter_plot':
                fig = generate_scatter_plot(df, x_column, y_column)
            elif graph_type == 'box_plot':
                fig = generate_box_plot(df, columns)
            elif graph_type == 'pie_chart':
                fig = generate_pie_chart(df, column)
            elif graph_type == 'multiple_histograms':
                fig = generate_multiple_histograms(df, columns)
            elif graph_type == 'line_chart':
                fig = generate_line_chart(df, x_column, y_column)
            elif graph_type == 'logarithmic_chart':
                fig = generate_logarithmic_chart(df, x_column, y_column)
            else:
                continue  # Ignore unknown graph type

            if fig is not None:
                fig_json = json.loads(json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder))
                output[graph_type] = {
                    'title': fig.layout.title.text if fig.layout.title.text else graph_type.replace('_', ' ').title(),
                    'figure': fig_json
                }
                print(f"График {graph_type} успешно создан.")
        except ValueError as ve:
            output[graph_type] = {'error': f'Ошибка: {str(ve)}'}
            print(f"Ошибка при создании графика {graph_type}: {ve}")
        except Exception as e:
            output[graph_type] = {'error': f'Непредвиденная ошибка: {str(e)}'}
            print(f"Ошибка при создании графика {graph_type}: {e}")

    return json.dumps(output, indent=4)
