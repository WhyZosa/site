import json
import base64
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from io import StringIO

def process_missing_data(df, method):
    """
    Process the missing data in the DataFrame based on the specified method.
    Available methods: drop, fill_mean, fill_median, fill_mode.
    """
    if method == 'drop':
        return df.dropna()
    elif method == 'fill_mean':
        return df.fillna(df.mean())
    elif method == 'fill_median':
        return df.fillna(df.median())
    elif method == 'fill_mode':
        return df.fillna(df.mode().iloc[0])
    else:
        return df  # Return the DataFrame unmodified if the method is unrecognized.

def generate_descriptive_table(df):
    """
    Generate a descriptive statistics table from the DataFrame.
    """
    desc_table = df.describe().to_json()
    return desc_table

def generate_scatter_matrix(df, columns):
    """
    Generate a scatter matrix for the specified columns of the DataFrame.
    """
    fig = px.scatter_matrix(df, dimensions=columns)
    return fig

def generate_histogram(df, columns):
    """
    Generate a histogram for the specified columns of the DataFrame.
    """
    fig = px.histogram(df, x=columns)
    return fig

def generate_heatmap(df, columns):
    """
    Generate a heatmap based on the correlation matrix of the specified columns.
    """
    corr_matrix = df[columns].corr()
    fig = px.imshow(corr_matrix, text_auto=True, color_continuous_scale='RdBu_r')
    return fig

def generate_scatter_plot(df, x_column, y_column):
    """
    Generate a scatter plot using the specified x and y columns.
    """
    fig = px.scatter(df, x=x_column, y=y_column)
    return fig

def generate_box_plot(df, columns):
    """
    Generate a box plot for the specified columns of the DataFrame.
    """
    fig = px.box(df, y=columns)
    return fig

def generate_pie_chart(df, column):
    """
    Generate a pie chart based on the values in the specified column.
    """
    fig = px.pie(df, names=column)
    return fig

def generate_multiple_histograms(df, columns):
    """
    Generate multiple histograms for the specified columns.
    """
    fig = go.Figure()
    for col in columns:
        fig.add_trace(go.Histogram(x=df[col], name=col))
    fig.update_layout(barmode='overlay')
    fig.update_traces(opacity=0.75)
    return fig

def generate_line_chart(df, x_column, y_column):
    """
    Generate a line chart using the specified x and y columns.
    """
    fig = px.line(df, x=x_column, y=y_column)
    return fig

def generate_logarithmic_chart(df, x_column, y_column):
    """
    Generate a logarithmic line chart using the specified x and y columns.
    """
    fig = px.line(df, x=x_column, y=y_column)
    fig.update_layout(yaxis_type="log")
    return fig

def fig_to_base64(fig):
    """
    Convert a Plotly figure to a base64-encoded string for embedding in JSON.
    """
    img_bytes = fig.to_image(format="png")
    return base64.b64encode(img_bytes).decode('utf8')

def read_file(data_path):
    """
    Read the data file based on its extension and return a pandas DataFrame.
    Supports CSV, XLSX, XLS, and JSON formats.
    """
    file_extension = data_path.split('.')[-1]
    if file_extension == 'csv':
        return pd.read_csv(data_path)
    elif file_extension in ['xls', 'xlsx']:
        return pd.read_excel(data_path)
    elif file_extension == 'json':
        return pd.read_json(data_path)
    else:
        raise ValueError("Unsupported file type. Only CSV, Excel (XLS, XLSX), and JSON are supported.")

def process_json(input_json):
    """
    Process the input JSON, generate graphs based on the specified instructions, 
    and return the results as a JSON-encoded string.
    """
    user_input = json.loads(input_json)
    df_json = user_input['data_path']  # Теперь это строка с данными DataFrame в формате JSON
    missing_data_method = user_input['missing_data_method']
    graphs = user_input['graphs']

    # Преобразуем строку JSON обратно в DataFrame
    df = pd.read_json(StringIO(df_json))  # Используем StringIO для корректной передачи строки JSON

    # Process missing data
    df = process_missing_data(df, missing_data_method)

    output = {}

    for graph in graphs:
        graph_type = graph['type']
        columns = graph.get('columns', [])
        x_column = graph.get('x_column', '')
        y_column = graph.get('y_column', '')
        column = graph.get('column', '')
        fig = None  # Initialize fig to avoid 'possibly unbound' error
        
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

        if fig:
            output[graph_type] = {
                'title': graph_type.replace('_', ' ').title(),
                'figure_base64': fig_to_base64(fig)
            }

    return json.dumps(output, indent=4)

# Example usage
EXAMPLE_INPUT_JSON = '''
{
    "data_path": "data_file.xlsx",
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

output_json = process_json(EXAMPLE_INPUT_JSON)
print(output_json)
