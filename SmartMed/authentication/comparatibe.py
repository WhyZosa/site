import pandas as pd
import numpy as np
from scipy import stats
import json


def generate_test_kolmogorov_smirnov(df, column1, column2):
    stat, p_value = stats.ks_2samp(df[column1].dropna(), df[column2].dropna())
    return {"statistic": stat, "p_value": p_value}


def generate_t_criterion_student_independent(df, column1, column2):
    stat, p_value = stats.ttest_ind(df[column1].dropna(), df[column2].dropna())
    return {"statistic": stat, "p_value": p_value}


def generate_t_criterion_student_dependent(df, column1, column2):
    stat, p_value = stats.ttest_rel(df[column1].dropna(), df[column2].dropna())
    return {"statistic": stat, "p_value": p_value}


def generate_u_criterion_mann_whitney(df, column1, column2):
    stat, p_value = stats.mannwhitneyu(df[column1].dropna(), df[column2].dropna())
    return {"statistic": stat, "p_value": p_value}


def generate_t_criterion_wilcoxon(df, column1, column2):
    stat, p_value = stats.wilcoxon(df[column1].dropna(), df[column2].dropna())
    return {"statistic": stat, "p_value": p_value}


def generate_chi2_pearson(df, column1, column2):
    contingency_table = pd.crosstab(df[column1], df[column2])
    stat, p_value, dof, expected = stats.chi2_contingency(contingency_table)
    return {"statistic": stat, "p_value": p_value, "dof": dof, "expected": expected.tolist()}


def generate_sensitivity_specificity(df, column1, column2):
    true_positive = len(df[(df[column1] == 1) & (df[column2] == 1)])
    false_positive = len(df[(df[column1] == 1) & (df[column2] == 0)])
    true_negative = len(df[(df[column1] == 0) & (df[column2] == 0)])
    false_negative = len(df[(df[column1] == 0) & (df[column2] == 1)])

    sensitivity = true_positive / (true_positive + false_negative) if (true_positive + false_negative) != 0 else 0
    specificity = true_negative / (true_negative + false_positive) if (true_negative + false_positive) != 0 else 0

    return {"sensitivity": sensitivity, "specificity": specificity}


def generate_risk_relations(df, column1, column2):
    risk_group1 = df[df[column1] == 1][column2].mean()
    risk_group0 = df[df[column1] == 0][column2].mean()

    # Если один из рисков не может быть рассчитан, вернуть NaN
    if risk_group0 == 0 or risk_group1 == 0:
        return {"risk_ratio": np.nan}

    risk_ratio = risk_group1 / risk_group0
    return {"risk_ratio": risk_ratio}



def generate_odds_relations(df, column1, column2):
    contingency_table = pd.crosstab(df[column1], df[column2])
    if not {0, 1}.issubset(contingency_table.columns):
        raise ValueError("Column2 must contain binary values (0 and 1).")

    odds_group1 = (contingency_table[1][1] / contingency_table[1][0]) if contingency_table[1][0] != 0 else np.nan
    odds_group0 = (contingency_table[0][1] / contingency_table[0][0]) if contingency_table[0][0] != 0 else np.nan
    odds_ratio = odds_group1 / odds_group0 if odds_group0 != 0 else np.nan
    return {"odds_ratio": odds_ratio}


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
        return df  # Если метод не указан или не распознан


def process_json_comparative(input_json):
    user_input = json.loads(input_json)
    data_path = user_input['data_path']
    missing_data_method = user_input.get('missing_data_method', 'fill_mean')
    tests = user_input['tests']

    try:
        df = pd.read_excel(data_path) if data_path.endswith('.xlsx') else pd.read_csv(data_path)
    except Exception as e:
        return json.dumps({"error": f"Ошибка при чтении файла данных: {str(e)}"})

    df = process_missing_data(df, missing_data_method)

    output = {}

    for test in tests:
        test_type = test.get('type')
        column1 = test.get('column1')
        column2 = test.get('column2')

        try:
            if test_type == 'kolmogorov_smirnov' and column1 and column2:
                output[test_type] = generate_test_kolmogorov_smirnov(df, column1, column2)
            elif test_type == 't_criterion_student_independent' and column1 and column2:
                output[test_type] = generate_t_criterion_student_independent(df, column1, column2)
            elif test_type == 't_criterion_student_dependent' and column1 and column2:
                output[test_type] = generate_t_criterion_student_dependent(df, column1, column2)
            elif test_type == 'u_criterion_mann_whitney' and column1 and column2:
                output[test_type] = generate_u_criterion_mann_whitney(df, column1, column2)
            elif test_type == 't_criterion_wilcoxon' and column1 and column2:
                output[test_type] = generate_t_criterion_wilcoxon(df, column1, column2)
            elif test_type == 'chi2_pearson' and column1 and column2:
                output[test_type] = generate_chi2_pearson(df, column1, column2)
            elif test_type == 'sensitivity_specificity' and column1 and column2:
                output[test_type] = generate_sensitivity_specificity(df, column1, column2)
            elif test_type == 'risk_relations' and column1 and column2:
                output[test_type] = generate_risk_relations(df, column1, column2)
            elif test_type == 'odds_relations' and column1 and column2:
                output[test_type] = generate_odds_relations(df, column1, column2)
            else:
                output[test_type] = {"error": f"Неизвестный или некорректно указанный тип анализа: {test_type}"}
        except Exception as e:
            output[test_type] = {"error": f"Ошибка выполнения анализа {test_type}: {str(e)}"}

    return json.dumps(output, indent=4, ensure_ascii=False)
