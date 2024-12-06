import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import json
import base64
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.metrics import (confusion_matrix, roc_curve, auc, precision_recall_curve,
                             f1_score, precision_score, recall_score, r2_score, mean_squared_error)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from scipy import stats

RANDOM_SEED = 42


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
        return df


def fig_to_base64(fig):
    img_bytes = fig.to_image(format="png")
    return base64.b64encode(img_bytes).decode('utf8')


# === Логистическая регрессия ===

def logistic_regression_analysis(df, target_column, feature_columns):
    X = df[feature_columns]
    y = df[target_column]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.3, random_state=RANDOM_SEED)

    model = LogisticRegression(random_state=RANDOM_SEED)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    auc_score = auc(*roc_curve(y_test, y_proba)[:2])

    metrics = {
        "precision": round(precision, 3),
        "recall": round(recall, 3),
        "f1_score": round(f1, 3),
        "auc": round(auc_score, 3)
    }

    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    confusion = {
        "TP": tp, "FP": fp, "TN": tn, "FN": fn
    }

    fpr, tpr, _ = roc_curve(y_test, y_proba)
    fig_roc = go.Figure()
    fig_roc.add_trace(go.Scatter(x=fpr, y=tpr, mode='lines', name='ROC Curve'))
    fig_roc.add_trace(go.Scatter(x=[0, 1], y=[0, 1], mode='lines', name='Random', line=dict(dash='dash')))
    fig_roc.update_layout(title='ROC Curve', xaxis_title='False Positive Rate', yaxis_title='True Positive Rate')

    precision_vals, recall_vals, _ = precision_recall_curve(y_test, y_proba)
    fig_pr = go.Figure()
    fig_pr.add_trace(go.Scatter(x=recall_vals, y=precision_vals, mode='lines', name='Precision-Recall Curve'))
    fig_pr.update_layout(title='Precision-Recall Curve', xaxis_title='Recall', yaxis_title='Precision')

    coef = model.coef_[0]
    summary = []
    for i, col in enumerate(feature_columns):
        se = np.std(X_train[:, i]) / np.sqrt(len(X_train))
        t_stat = coef[i] / se
        p_val = 2 * (1 - stats.t.cdf(np.abs(t_stat), df=len(X_train) - 1))
        summary.append({
            "Variable": col,
            "Coefficient": round(coef[i], 3),
            "Std. Error": round(se, 3),
            "t-statistic": round(t_stat, 3),
            "p-value": round(p_val, 3)
        })

    return {
        "metrics": metrics,
        "confusion_matrix": confusion,
        "roc_curve": fig_to_base64(fig_roc),
        "pr_curve": fig_to_base64(fig_pr),
        "summary_table": summary
    }


# === Линейная регрессия ===

def linear_regression_analysis(df, target_column, feature_columns):
    X = df[feature_columns]
    y = df[target_column]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.3, random_state=RANDOM_SEED)

    model = LinearRegression()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    r2 = r2_score(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)

    metrics = {
        "r2_score": round(r2, 3),
        "mse": round(mse, 3)
    }

    fig_pred = px.scatter(x=y_test, y=y_pred, labels={'x': 'True Values', 'y': 'Predicted Values'},
                          title="True vs Predicted Values")

    coef = model.coef_
    summary = []
    for i, col in enumerate(feature_columns):
        se = np.std(X_train[:, i]) / np.sqrt(len(X_train))
        t_stat = coef[i] / se
        p_val = 2 * (1 - stats.t.cdf(np.abs(t_stat), df=len(X_train) - 1))
        summary.append({
            "Variable": col,
            "Coefficient": round(coef[i], 3),
            "Std. Error": round(se, 3),
            "t-statistic": round(t_stat, 3),
            "p-value": round(p_val, 3)
        })

    return {
        "metrics": metrics,
        "predicted_vs_actual": fig_to_base64(fig_pred),
        "summary_table": summary
    }


# === Основная функция обработки JSON ===

def process_json(input_json):
    user_input = json.loads(input_json)
    data_path = user_input['data_path']
    missing_data_method = user_input['missing_data_method']
    tests = user_input['tests']

    df = pd.read_excel(data_path)
    df = process_missing_data(df, missing_data_method)

    output = {}

    for test in tests:
        test_type = test['type']
        target_column = test.get('target_column', '')
        feature_columns = test.get('feature_columns', [])

        if test_type == 'logistic_regression':
            result = logistic_regression_analysis(df, target_column, feature_columns)
        elif test_type == 'linear_regression':
            result = linear_regression_analysis(df, target_column, feature_columns)
        else:
            continue

            # Конвертируем все значения в стандартные Python-форматы
        def convert_types(obj):
            if isinstance(obj, pd.DataFrame):
                return obj.astype(object).to_dict(orient='records')
            elif isinstance(obj, np.int64):
                return int(obj)
            elif isinstance(obj, np.float64):
                return float(obj)
            elif isinstance(obj, (np.ndarray, list)):
                return [convert_types(i) for i in obj]
            elif isinstance(obj, dict):
                return {k: convert_types(v) for k, v in obj.items()}
            return obj

        output[test_type] = convert_types(result)

    return json.dumps(output, indent=4)


# Пример использования
input_json = '''
{
    "data_path": "age.xlsx",
    "missing_data_method": "fill_mean",
    "tests": [
        {
            "type": "logistic_regression",
            "target_column": "predicted",
            "feature_columns": ["men", "women"]
        },
        {
            "type": "linear_regression",
            "target_column": "predicted",
            "feature_columns": ["men", "women"]
        }
    ]
}
'''

if __name__ == "__main__":
    output_json = process_json(input_json)
    print(output_json)
