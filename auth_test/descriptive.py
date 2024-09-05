import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import json
import base64
from io import BytesIO

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
        return df  # Если метод не указан или не распознан

def generate_descriptive_table(df):
    desc_table = df.describe().to_json()
    return desc_table

def generate_scatter_matrix(df, columns):
    fig = px.scatter_matrix(df, dimensions=columns)
    print(321)
    return fig

def generate_histogram(df, columns):
    fig = px.histogram(df, x=columns)
    return fig

def generate_heatmap(df, columns):
    corr_matrix = df[columns].corr()
    fig = px.imshow(corr_matrix, text_auto=True, color_continuous_scale='RdBu_r')
    return fig

def generate_scatter_plot(df, x_column, y_column):
    fig = px.scatter(df, x=x_column, y=y_column)
    return fig

def generate_box_plot(df, columns):
    fig = px.box(df, y=columns)
    return fig

def generate_pie_chart(df, column):
    fig = px.pie(df, names=column)
    return fig

def generate_multiple_histograms(df, columns):
    fig = go.Figure()
    for col in columns:
        fig.add_trace(go.Histogram(x=df[col], name=col))
    fig.update_layout(barmode='overlay')
    fig.update_traces(opacity=0.75)
    return fig

def generate_line_chart(df, x_column, y_column):
    fig = px.line(df, x=x_column, y=y_column)
    return fig

def generate_logarithmic_chart(df, x_column, y_column):
    fig = px.line(df, x=x_column, y=y_column)
    fig.update_layout(yaxis_type="log")
    return fig

def fig_to_base64(fig):
    img_bytes = fig.to_image(format="png")
    return base64.b64encode(img_bytes).decode('utf8')

def process_json(input_json):
    user_input = json.loads(input_json)
    data_path = user_input['data_path']
    missing_data_method = user_input['missing_data_method']
    graphs = user_input['graphs']

    df = pd.read_excel(data_path)

    df = process_missing_data(df, missing_data_method)

    output = {}

    for graph in graphs:
        graph_type = graph['type']
        columns = graph.get('columns', [])
        x_column = graph.get('x_column', '')
        y_column = graph.get('y_column', '')
        column = graph.get('column', '')
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
            continue
        if graph_type != 'descriptive_table':
            output[graph_type] = {
                'title': graph_type.replace('_', ' ').title(),
                'figure_base64': fig_to_base64(fig)
            }

    return json.dumps(output, indent=4)

# Пример использования
input_json = '''
{
    "data_path": "age.xlsx",
    "missing_data_method": "fill_mean",
    "graphs": [
        {
            "type": "descriptive_table"
        },
        {
            "type": "scatter_matrix",
            "columns": ["men", "women"]
        },
        {
            "type": "histogram",
            "columns": ["men"]
        },
        {
            "type": "heatmap",
            "columns": ["men", "women"]
        },
        {
            "type": "scatter_plot",
            "x_column": "men",
            "y_column": "women"
        },
        {
            "type": "box_plot",
            "columns": ["men", "women"]
        },
        {
            "type": "pie_chart",
            "column": "men"
        },
        {
            "type": "multiple_histograms",
            "columns": ["men", "women"]
        },
        {
            "type": "line_chart",
            "x_column": "men",
            "y_column": "women"
        },
        {
            "type": "logarithmic_chart",
            "x_column": "men",
            "y_column": "women"
        }
    ]
}
'''

output_json = process_json(input_json)
print(output_json)
#код для отображения графиков (проверка, что все работает)
#output_data = json.loads(output_json)
#
# base64_str_histogram = output_data['heatmap']['figure_base64']
# base64_str_boxplot = output_data['scatter_matrix']['figure_base64']
#
# image_data_histogram = base64.b64decode(base64_str_histogram)
# image_data_boxplot = base64.b64decode(base64_str_boxplot)
#
# with open('histogram.png', 'wb') as f:
#     f.write(image_data_histogram)
#
# with open('boxplot.png', 'wb') as f:
#     f.write(image_data_boxplot)
#
#для ображения к таблицаи
# table_dict = output_data['descriptive_table']['table_json']
# table_dict = json.loads(table_dict)
# df_restored = pd.DataFrame(table_dict)
# print(df_restored)